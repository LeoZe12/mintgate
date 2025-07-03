import { useCallback } from 'react';
import { plateRecognizerOfflineService, type PlateRecognizerOfflineResponse } from '@/services/plateRecognizerOfflineService';
import { ESP32_CONFIG } from '@/config/esp32Config';

export interface PlateRecognitionResult {
  results: Array<{
    plate: string;
    confidence: number;
    region?: {
      code: string;
    };
    vehicle?: {
      type: string;
    };
  }>;
  processing_time: number;
  filename: string;
}

export const usePlateRecognizer = () => {
  const recognizePlate = useCallback(async (imageFile: File): Promise<PlateRecognitionResult> => {
    // Usar o serviço aprimorado em vez do serviço básico
    const { enhancedPlateRecognizerService } = await import('@/services/enhancedPlateRecognizerService');
    
    if (ESP32_CONFIG.esp32.debugMode) {
      console.log('🔍 Iniciando reconhecimento com SDK offline aprimorado...');
    }

    try {
      const result = await enhancedPlateRecognizerService.recognizePlateEnhanced(imageFile);

      // Converter para formato esperado pela aplicação
      return {
        results: result.results.map((r: any) => ({
          plate: r.plate,
          confidence: r.confidence,
          region: r.region ? { code: r.region.code } : undefined,
          vehicle: r.vehicle ? { type: r.vehicle.type } : undefined,
        })),
        processing_time: result.processing_time,
        filename: result.filename,
      };
    } catch (error) {
      console.error('Erro no reconhecimento de placas:', error);
      throw error;
    }
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const isOnline = await plateRecognizerOfflineService.testConnection();
      
      if (ESP32_CONFIG.esp32.debugMode) {
        console.log('🔗 Status SDK Offline:', isOnline ? 'Online' : 'Offline');
      }
      
      return isOnline;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }, []);

  const updateEndpoint = useCallback((endpoint: string) => {
    plateRecognizerOfflineService.updateEndpoint(endpoint);
  }, []);
  
  return {
    recognizePlate,
    testConnection,
    updateEndpoint,
    isOfflineMode: ESP32_CONFIG.platRecognizerOffline.enabled,
    currentEndpoint: ESP32_CONFIG.platRecognizerOffline.endpoint,
  };
};
