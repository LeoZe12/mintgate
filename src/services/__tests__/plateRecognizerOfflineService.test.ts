
import { PlateRecognizerOfflineService } from '../plateRecognizerOfflineService';

// Mock do fetch global
global.fetch = jest.fn();

// Mock da configuração
jest.mock('@/config/esp32Config', () => ({
  ESP32_CONFIG: {
    camera: {
      url: 'rtsp://admin:senha@192.168.1.100:554/stream',
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
        'http://localhost:8080/health',
        expect.objectContaining({
          method: 'GET',
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
      plate: 'ABC1234',
      confidence: 0.95,
      region: 'br',
      vehicle_type: 'car',
      image: 'base64encodedimage',
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
        'http://localhost:8080/v1/plate-reader',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('deve lançar erro quando a resposta não for ok', async () => {
      const errorResponse = 'Invalid image format';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue(errorResponse),
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
      const newEndpoint = 'http://192.168.1.100:8080/v1/plate-reader';
      service.updateEndpoint(newEndpoint);
      expect((service as any).baseUrl).toBe(newEndpoint);
    });
  });
});
