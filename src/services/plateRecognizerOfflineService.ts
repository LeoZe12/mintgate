
import { ESP32_CONFIG } from '@/config/esp32Config';

export interface PlateRecognizerOfflineRequest {
  upload: File;
  regions?: string[];
  camera_id?: string;
}

export interface PlateRecognizerOfflineResponse {
  processing_time: number;
  results: Array<{
    plate: string;
    confidence: number;
    region?: {
      code: string;
      score: number;
    };
    vehicle?: {
      type: string;
      color?: Array<{
        color: string;
        confidence: number;
      }>;
    };
    box?: {
      xmin: number;
      ymin: number;
      xmax: number;
      ymax: number;
    };
    dscore?: number;
  }>;
  filename: string;
  version: number;
  camera_id?: string;
  timestamp: string;
}

export interface PlateRecognizerOfflineError {
  error: string;
  details?: string;
}

export class PlateRecognizerOfflineService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = ESP32_CONFIG.platRecognizerOffline.endpoint;
    this.timeout = 30000; // 30 segundos
  }

  updateEndpoint(endpoint: string): void {
    this.baseUrl = endpoint;
  }

  async testConnection(): Promise<boolean> {
    try {
      const healthUrl = this.baseUrl.replace('/v1/plate-reader/', '/health');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: this.getHeaders(),
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão com SDK offline:', error);
      return false;
    }
  }

  async recognizePlate(
    imageFile: File,
    options?: {
      regions?: string[];
      camera_id?: string;
    }
  ): Promise<PlateRecognizerOfflineResponse> {
    const formData = new FormData();
    formData.append('upload', imageFile);

    if (options?.regions && options.regions.length > 0) {
      formData.append('regions', options.regions.join(','));
    } else if (ESP32_CONFIG.platRecognizer.regions.length > 0) {
      formData.append('regions', ESP32_CONFIG.platRecognizer.regions.join(','));
    }

    if (options?.camera_id) {
      formData.append('camera_id', options.camera_id);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: this.getHeaders(),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: PlateRecognizerOfflineError = await response.json();
        throw new Error(`SDK Offline Error ${response.status}: ${errorData.error}`);
      }

      const result: PlateRecognizerOfflineResponse = await response.json();
      
      const filteredResults = {
        ...result,
        results: result.results.filter(
          r => r.confidence >= ESP32_CONFIG.platRecognizer.confidenceThreshold
        )
      };

      if (ESP32_CONFIG.esp32.debugMode) {
        console.log('🔍 Resposta do SDK Offline:', filteredResults);
      }

      return filteredResults;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: SDK offline não respondeu em tempo hábil');
        }
        throw error;
      }
      
      throw new Error('Erro desconhecido no SDK offline');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (ESP32_CONFIG.platRecognizerOffline.apiToken) {
      headers['Authorization'] = `Token ${ESP32_CONFIG.platRecognizerOffline.apiToken}`;
    }
    
    return headers;
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato de imagem não suportado. Use JPEG, PNG ou WebP.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Imagem muito grande. Máximo permitido: 10MB.'
      };
    }

    return { valid: true };
  }
}

export const plateRecognizerOfflineService = new PlateRecognizerOfflineService();
