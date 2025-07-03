
import { renderHook, act } from '@testing-library/react';
import { usePlateRecognizer } from '../usePlateRecognizer';
import { plateRecognizerOfflineService } from '@/services/plateRecognizerOfflineService';

// Mock do service
jest.mock('@/services/plateRecognizerOfflineService', () => ({
  plateRecognizerOfflineService: {
    validateImage: jest.fn(),
    processImage: jest.fn(),
    testConnection: jest.fn(),
    updateEndpoint: jest.fn(),
  },
}));

// Mock da configuração
jest.mock('@/config/esp32Config', () => ({
  ESP32_CONFIG: {
    platRecognizerOffline: {
      enabled: true,
      endpoint: 'http://localhost:8081/v1/plate-reader/',
    },
    platRecognizer: {
      regions: ['br'],
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
    it('deve reconhecer placa com sucesso', async () => {
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
        version: 1,
        timestamp: '2023-01-01T00:00:00Z',
      };

      mockService.validateImage.mockReturnValue({ valid: true });
      mockService.processImage.mockResolvedValue(mockServiceResponse);

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

      expect(mockService.validateImage).toHaveBeenCalledWith(mockFile);
      expect(mockService.processImage).toHaveBeenCalledWith(mockFile, {
        regions: ['br'],
        enableFallback: true,
      });
    });

    it('deve lançar erro para imagem inválida', async () => {
      const mockFile = new File(['test'], 'test.gif', { type: 'image/gif' });
      
      mockService.validateImage.mockReturnValue({ 
        valid: false, 
        error: 'Formato não suportado' 
      });

      const { result } = renderHook(() => usePlateRecognizer());

      await act(async () => {
        await expect(result.current.recognizePlate(mockFile)).rejects.toThrow(
          'Formato não suportado'
        );
      });

      expect(mockService.processImage).not.toHaveBeenCalled();
    });

    it('deve propagar erros do service', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      mockService.validateImage.mockReturnValue({ valid: true });
      mockService.processImage.mockRejectedValue(new Error('Service error'));

      const { result } = renderHook(() => usePlateRecognizer());

      await act(async () => {
        await expect(result.current.recognizePlate(mockFile)).rejects.toThrow(
          'Service error'
        );
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

    it('deve tratar erros de conexão', async () => {
      mockService.testConnection.mockRejectedValue(new Error('Network error'));

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
    it('deve retornar propriedades corretas', () => {
      const { result } = renderHook(() => usePlateRecognizer());

      expect(result.current.isOfflineMode).toBe(true);
      expect(result.current.currentEndpoint).toBe('http://localhost:8081/v1/plate-reader/');
    });
  });
});
