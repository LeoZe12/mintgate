
import { ESP32_CONFIG } from '@/config/esp32Config';

// Tipos baseados na documentação oficial do Plate Recognizer SDK Offline
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

  /**
   * Atualiza o endpoint base do serviço
   */
  updateEndpoint(endpoint: string): void {
    this.baseUrl = endpoint;
  }

  /**
   * Testa a conexão com o SDK offline
   */
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

  /**
   * Reconhece placas em uma imagem usando o SDK offline
   */
  async recognizePlate(
    imageFile: File,
    options?: {
      regions?: string[];
      camera_id?: string;
    }
  ): Promise<PlateRecognizerOfflineResponse> {
    const formData = new FormData();
    formData.append('upload', imageFile);

    // Adicionar regiões se especificadas
    if (options?.regions && options.regions.length > 0) {
      formData.append('regions', options.regions.join(','));
    } else if (ESP32_CONFIG.platRecognizer.regions.length > 0) {
      formData.append('regions', ESP32_CONFIG.platRecognizer.regions.join(','));
    }

    // Adicionar camera_id se especificado
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
      
      // Filtrar resultados por threshold de confiança
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

  /**
   * Fallback para API online quando SDK offline não está disponível
   */
  async fallbackToOnlineApi(imageFile: File): Promise<PlateRecognizerOfflineResponse> {
    if (!ESP32_CONFIG.platRecognizer.apiKey) {
      throw new Error('API key não configurada para fallback');
    }

    const formData = new FormData();
    formData.append('upload', imageFile);

    if (ESP32_CONFIG.platRecognizer.regions.length > 0) {
      formData.append('regions', ESP32_CONFIG.platRecognizer.regions.join(','));
    }

    const response = await fetch(ESP32_CONFIG.platRecognizer.apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Token ${ESP32_CONFIG.platRecognizer.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Online Error ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
    }

    const result = await response.json();
    
    // Normalizar resposta para o formato esperado
    return {
      ...result,
      results: result.results.filter(
        (r: any) => r.confidence >= ESP32_CONFIG.platRecognizer.confidenceThreshold
      )
    };
  }

  /**
   * Método principal com fallback automático
   */
  async processImage(
    imageFile: File,
    options?: {
      regions?: string[];
      camera_id?: string;
      enableFallback?: boolean;
    }
  ): Promise<PlateRecognizerOfflineResponse> {
    try {
      // Tentar SDK offline primeiro
      return await this.recognizePlate(imageFile, options);
    } catch (error) {
      console.warn('SDK Offline falhou:', error);
      
      // Fallback para API online se habilitado
      if (options?.enableFallback !== false && ESP32_CONFIG.platRecognizer.apiKey) {
        console.log('🔄 Usando fallback para API online...');
        return await this.fallbackToOnlineApi(imageFile);
      }
      
      throw error;
    }
  }

  /**
   * Headers para requisições
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Adicionar token de API se disponível
    if (ESP32_CONFIG.platRecognizerOffline.apiToken) {
      headers['Authorization'] = `Token ${ESP32_CONFIG.platRecognizerOffline.apiToken}`;
    }
    
    return headers;
  }

  /**
   * Validação de imagem
   */
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

// Instância singleton do serviço
export const plateRecognizerOfflineService = new PlateRecognizerOfflineService();
