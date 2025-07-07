
import { ESP32_CONFIG } from '@/config/esp32Config';

export interface PlateRecognizerOfflineRequest {
  file: File;
}

export interface PlateRecognizerOfflineResponse {
  plate: string;
  confidence: number;
  region: string;
  vehicle_type: string;
  image: string;
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
    this.baseUrl = 'http://localhost:8080/v1/plate-reader';
    this.timeout = 30000; // 30 segundos
  }

  updateEndpoint(endpoint: string): void {
    this.baseUrl = endpoint;
  }

  async testConnection(): Promise<boolean> {
    try {
      const healthUrl = 'http://localhost:8080/health';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão com SDK offline:', error);
      return false;
    }
  }

  async recognizePlate(imageFile: File): Promise<PlateRecognizerOfflineResponse> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log('🔍 Enviando imagem para SDK Offline:', this.baseUrl);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SDK Offline Error ${response.status}: ${errorText}`);
      }

      const result: PlateRecognizerOfflineResponse = await response.json();
      
      console.log('✅ Resposta do SDK Offline:', result);
      return result;

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

  validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato de imagem não suportado. Use JPEG ou PNG.'
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
