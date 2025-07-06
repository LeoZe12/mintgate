
import { PlateRecognizerOfflineService } from '../plateRecognizerOfflineService';

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
  });

  describe('validateImage', () => {
    it('deve validar imagem JPEG', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = service.validateImage(file);
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar formato não suportado', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result = service.validateImage(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de imagem não suportado');
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
