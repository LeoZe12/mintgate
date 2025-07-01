
import { useCallback } from 'react';
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
    const formData = new FormData();
    formData.append('upload', imageFile);
    
    // Determinar qual endpoint usar baseado na configuração
    const useOffline = ESP32_CONFIG.platRecognizerOffline.enabled;
    const endpoint = useOffline 
      ? ESP32_CONFIG.platRecognizerOffline.endpoint
      : ESP32_CONFIG.platRecognizer.apiUrl;
    
    const headers: Record<string, string> = {};
    
    // Configurar headers baseado no modo
    if (useOffline) {
      // SDK Offline não requer Authorization header
      if (ESP32_CONFIG.esp32.debugMode) {
        console.log('🔍 Usando Plate Recognizer SDK Offline:', endpoint);
      }
    } else {
      // API Online requer token de autorização
      headers['Authorization'] = `Token ${ESP32_CONFIG.platRecognizer.apiKey}`;
      if (ESP32_CONFIG.esp32.debugMode) {
        console.log('🌐 Usando Plate Recognizer API Online:', endpoint);
      }
    }
    
    // Adicionar regiões se configurado
    if (ESP32_CONFIG.platRecognizer.regions.length > 0) {
      formData.append('regions', ESP32_CONFIG.platRecognizer.regions.join(','));
    }
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Filtrar resultados por threshold de confiança
      const filteredResults = {
        ...result,
        results: result.results.filter((r: any) => 
          r.confidence >= ESP32_CONFIG.platRecognizer.confidenceThreshold
        )
      };
      
      if (ESP32_CONFIG.esp32.debugMode) {
        console.log('📋 Resultado do reconhecimento:', filteredResults);
      }
      
      return filteredResults;
    } catch (error) {
      console.error('Erro no reconhecimento de placas:', error);
      
      // Se estava usando offline e falhou, tentar online como fallback
      if (useOffline && ESP32_CONFIG.platRecognizer.apiKey) {
        console.log('🔄 Fallback para API Online...');
        
        const fallbackHeaders = {
          'Authorization': `Token ${ESP32_CONFIG.platRecognizer.apiKey}`
        };
        
        try {
          const fallbackResponse = await fetch(ESP32_CONFIG.platRecognizer.apiUrl, {
            method: 'POST',
            headers: fallbackHeaders,
            body: formData,
          });
          
          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            return {
              ...fallbackResult,
              results: fallbackResult.results.filter((r: any) => 
                r.confidence >= ESP32_CONFIG.platRecognizer.confidenceThreshold
              )
            };
          }
        } catch (fallbackError) {
          console.error('Erro no fallback para API Online:', fallbackError);
        }
      }
      
      throw error;
    }
  }, []);
  
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const useOffline = ESP32_CONFIG.platRecognizerOffline.enabled;
      const endpoint = useOffline 
        ? ESP32_CONFIG.platRecognizerOffline.endpoint.replace('/v1/plate-reader/', '/health')
        : ESP32_CONFIG.platRecognizer.apiUrl.replace('/v1/plate-reader/', '/');
      
      const headers: Record<string, string> = {};
      if (!useOffline) {
        headers['Authorization'] = `Token ${ESP32_CONFIG.platRecognizer.apiKey}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão Plate Recognizer:', error);
      return false;
    }
  }, []);
  
  return {
    recognizePlate,
    testConnection,
    isOfflineMode: ESP32_CONFIG.platRecognizerOffline.enabled,
    currentEndpoint: ESP32_CONFIG.platRecognizerOffline.enabled 
      ? ESP32_CONFIG.platRecognizerOffline.endpoint
      : ESP32_CONFIG.platRecognizer.apiUrl,
  };
};
