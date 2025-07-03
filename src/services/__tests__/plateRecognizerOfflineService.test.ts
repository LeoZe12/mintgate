
import { PlateRecognizerOfflineService } from '../plateRecognizerOfflineService';
import { ESP32_CONFIG } from '@/config/esp32Config';

// Mock do fetch global
global.fetch = jest.fn();

// Mock da configuração
jest.mock('@/config/esp32Config', () => ({
  ESP32_CONFIG: {
    platRecognizerOffline: {
      endpoint: 'http://localhost:8081/v1/plate-reader/',
      apiToken: 'test-token',
    },
    platRecognizer: {
      confidenceThreshold: 0.8,
      regions: ['br'],
      apiKey: 'test-api-key',
      apiUrl: 'https://api.platerecognizer.com/v1/plate-reader/',
    },
    esp32: {
      debugMode: false,
    },
  },
}));

describe('PlateRecognizerOfflineService', () => {
  let service: PlateRecognizerOfflineService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new PlateRecognizerOfflineService();
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });

  describe('testConnection', () => {
    it('deve retornar true quando a conexão for bem-sucedida', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      const result = await service.testConnection();
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8081/health',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Authorization': 'Token test-token' },
        })
      );
    });

    it('deve retornar false quando a conexão falhar', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.testConnection();
      expect(result).toBe(false);
    });

    it('deve retornar false quando receber status não-ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await service.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('recognizePlate', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const mockSuccessResponse = {
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

    it('deve reconhecer placa com sucesso', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      } as any);

      const result = await service.recognizePlate(mockFile);
      
      expect(result).toEqual(mockSuccessResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8081/v1/plate-reader/',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Authorization': 'Token test-token' },
        })
      );
    });

    it('deve filtrar resultados por confidence threshold', async () => {
      const responseWithLowConfidence = {
        ...mockSuccessResponse,
        results: [
          { plate: 'ABC1234', confidence: 0.95, region: { code: 'br', score: 0.9 } },
          { plate: 'XYZ5678', confidence: 0.5, region: { code: 'br', score: 0.8 } }, // Abaixo do threshold
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(responseWithLowConfidence),
      } as any);

      const result = await service.recognizePlate(mockFile);
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].plate).toBe('ABC1234');
    });

    it('deve lançar erro quando a resposta não for ok', async () => {
      const errorResponse = {
        error: 'Invalid image format',
        details: 'Only JPEG, PNG and WebP are supported',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(errorResponse),
      } as any);

      await expect(service.recognizePlate(mockFile)).rejects.toThrow(
        'SDK Offline Error 400: Invalid image format'
      );
    });

    it('deve lançar erro de timeout', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve({} as Response), 35000); // Mais que o timeout
        })
      );

      await expect(service.recognizePlate(mockFile)).rejects.toThrow(
        'Timeout: SDK offline não respondeu em tempo hábil'
      );
    });

    it('deve incluir regiões na requisição', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      } as any);

      await service.recognizePlate(mockFile, { regions: ['us', 'br'] });
      
      const formData = mockFetch.mock.calls[0][1]?.body as FormData;
      expect(formData.get('regions')).toBe('us,br');
    });

    it('deve incluir camera_id na requisição', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      } as any);

      await service.recognizePlate(mockFile, { camera_id: 'cam-01' });
      
      const formData = mockFetch.mock.calls[0][1]?.body as FormData;
      expect(formData.get('camera_id')).toBe('cam-01');
    });
  });

  describe('fallbackToOnlineApi', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    it('deve usar a API online como fallback', async () => {
      const mockResponse = {
        processing_time: 0.3,
        results: [{ plate: 'ABC1234', confidence: 0.9 }],
        filename: 'test.jpg',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.fallbackToOnlineApi(mockFile);
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.platerecognizer.com/v1/plate-reader/',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Authorization': 'Token test-api-key' },
        })
      );
    });

    it('deve lançar erro quando API key não estiver configurada', async () => {
      // Temporarily override the mock
      const originalConfig = ESP32_CONFIG.platRecognizer.apiKey;
      (ESP32_CONFIG.platRecognizer as any).apiKey = '';

      await expect(service.fallbackToOnlineApi(mockFile)).rejects.toThrow(
        'API key não configurada para fallback'
      );

      // Restore original config
      (ESP32_CONFIG.platRecognizer as any).apiKey = originalConfig;
    });
  });

  describe('processImage', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    it('deve tentar SDK offline primeiro e usar fallback se falhar', async () => {
      // Primeira chamada (SDK offline) falha
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Segunda chamada (API online) sucesso
      const mockResponse = {
        processing_time: 0.3,
        results: [{ plate: 'ABC1234', confidence: 0.9 }],
        filename: 'test.jpg',
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.processImage(mockFile, { enableFallback: true });
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('deve lançar erro se fallback estiver desabilitado', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.processImage(mockFile, { enableFallback: false })
      ).rejects.toThrow('Network error');
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateImage', () => {
    it('deve validar imagem JPEG', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = service.validateImage(file);
      expect(result.valid).toBe(true);
    });

    it('deve validar imagem PNG', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const result = service.validateImage(file);
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar formato não suportado', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result = service.validateImage(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de imagem não suportado');
    });

    it('deve rejeitar arquivo muito grande', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      const result = service.validateImage(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Imagem muito grande');
    });
  });

  describe('updateEndpoint', () => {
    it('deve atualizar o endpoint base', () => {
      const newEndpoint = 'http://192.168.1.100:8080/v1/plate-reader/';
      service.updateEndpoint(newEndpoint);
      expect((service as any).baseUrl).toBe(newEndpoint);
    });
  });
});
