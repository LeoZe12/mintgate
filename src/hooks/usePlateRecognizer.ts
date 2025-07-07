
import { useCallback } from 'react';
import { plateRecognizerOfflineService, type PlateRecognizerOfflineResponse } from '@/services/plateRecognizerOfflineService';

export interface PlateRecognitionResult {
  plate: string;
  confidence: number;
  region: string;
  vehicle_type: string;
  timestamp: string;
}

export const usePlateRecognizer = () => {
  const recognizePlate = useCallback(async (imageFile: File): Promise<PlateRecognitionResult> => {
    console.log('🔍 Iniciando reconhecimento com SDK offline...');

    try {
      const result = await plateRecognizerOfflineService.recognizePlate(imageFile);

      return {
        plate: result.plate,
        confidence: result.confidence,
        region: result.region,
        vehicle_type: result.vehicle_type,
        timestamp: result.timestamp,
      };
    } catch (error) {
      console.error('Erro no reconhecimento de placas:', error);
      throw error;
    }
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const isOnline = await plateRecognizerOfflineService.testConnection();
      console.log('🔗 Status SDK Offline:', isOnline ? 'Online' : 'Offline');
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
    currentEndpoint: 'http://localhost:8080/v1/plate-reader',
  };
};
