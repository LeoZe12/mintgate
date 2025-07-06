
import { renderHook, act } from '@testing-library/react';
import { usePlateRecognizer } from '../usePlateRecognizer';
import { plateRecognizerOfflineService } from '@/services/plateRecognizerOfflineService';

// Mock do service
jest.mock('@/services/plateRecognizerOfflineService', () => ({
  plateRecognizerOfflineService: {
    testConnection: jest.fn(),
    updateEndpoint: jest.fn(),
  },
}));

// Mock do serviço aprimorado
jest.mock('@/services/enhancedPlateRecognizerService', () => ({
  enhancedPlateRecognizerService: {
    recognizePlateEnhanced: jest.fn(),
  },
}));

// Mock da configuração
jest.mock('@/config/esp32Config', () => ({
  ESP32_CONFIG: {
    platRecognizerOffline: {
      enabled: true,
      endpoint: 'http://localhost:8081/v1/plate-reader/',
    },
    esp32: {
      debugMode: false,
    },
  },
}));

describe('usePlateRecognizer', () => {
  const mockService = plateRecognizerOfflineService as jest.Mocked<typeof plateRecognizerOfflineService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recognizePlate', () => {
    it('deve reconhecer placa com sucesso usando o serviço offline', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockServiceResponse = {
        processing_time: 0.5,
        results: [
          {
            plate: 'ABC1234',
            confidence: 0.95,
            region: { code: 'br', score: 0.9 },
            vehicle: { type: 'Car' },
          },
        ],
        filename: 'test.jpg',
      };

      // Mock do serviço aprimorado
      const { enhancedPlateRecognizerService } = require('@/services/enhancedPlateRecognizerService');
      enhancedPlateRecognizerService.recognizePlateEnhanced.mockResolvedValue(mockServiceResponse);

      const { result } = renderHook(() => usePlateRecognizer());

      let recognitionResult;
      await act(async () => {
        recognitionResult = await result.current.recognizePlate(mockFile);
      });

      expect(recognitionResult).toEqual({
        results: [
          {
            plate: 'ABC1234',
            confidence: 0.95,
            region: { code: 'br' },
            vehicle: { type: 'Car' },
          },
        ],
        processing_time: 0.5,
        filename: 'test.jpg',
      });
    });
  });

  describe('testConnection', () => {
    it('deve testar conexão com sucesso', async () => {
      mockService.testConnection.mockResolvedValue(true);

      const { result } = renderHook(() => usePlateRecognizer());

      let connectionResult;
      await act(async () => {
        connectionResult = await result.current.testConnection();
      });

      expect(connectionResult).toBe(true);
      expect(mockService.testConnection).toHaveBeenCalled();
    });

    it('deve retornar false quando conexão falhar', async () => {
      mockService.testConnection.mockResolvedValue(false);

      const { result } = renderHook(() => usePlateRecognizer());

      let connectionResult;
      await act(async () => {
        connectionResult = await result.current.testConnection();
      });

      expect(connectionResult).toBe(false);
    });
  });

  describe('updateEndpoint', () => {
    it('deve atualizar endpoint', async () => {
      const newEndpoint = 'http://192.168.1.100:8080/v1/plate-reader/';

      const { result } = renderHook(() => usePlateRecognizer());

      act(() => {
        result.current.updateEndpoint(newEndpoint);
      });

      expect(mockService.updateEndpoint).toHaveBeenCalledWith(newEndpoint);
    });
  });

  describe('properties', () => {
    it('deve retornar endpoint correto', () => {
      const { result } = renderHook(() => usePlateRecognizer());

      expect(result.current.currentEndpoint).toBe('http://localhost:8081/v1/plate-reader/');
    });
  });
});
