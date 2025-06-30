
import { renderHook, act, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { useEsp32Status } from '../useEsp32Status';

// Mock do Supabase
const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom
  }
}));

// Mock do fetch global
global.fetch = jest.fn();

describe('useEsp32Status Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('inicializa com estado padrão', () => {
    const { result } = renderHook(() => useEsp32Status());

    expect(result.current.status).toBe('disconnected');
    expect(result.current.lastHeartbeat).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.openGate).toBe('function');
    expect(typeof result.current.closeGate).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('atualiza status para conectado quando API retorna sucesso', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        lastHeartbeat: '2024-01-01T12:00:00Z'
      })
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useEsp32Status());

    // Aguardar o fetch inicial
    await waitFor(() => {
      expect(result.current.status).toBe('connected');
    });

    expect(result.current.lastHeartbeat).toBe('2024-01-01T12:00:00Z');
    expect(result.current.isLoading).toBe(false);
  });

  it('persiste status no Supabase quando status é atualizado', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        lastHeartbeat: '2024-01-01T12:00:00Z'
      })
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    renderHook(() => useEsp32Status());

    // Aguardar persistência no Supabase
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('esp32_status_history');
      expect(mockInsert).toHaveBeenCalledWith({
        device_id: 'esp32_main',
        status: 'connected',
        last_heartbeat: '2024-01-01T12:00:00.000Z',
        is_loading: false
      });
    });
  });

  it('configura polling a cada 5 segundos', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        lastHeartbeat: '2024-01-01T12:00:00Z'
      })
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    renderHook(() => useEsp32Status());

    // Verificar chamada inicial
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Avançar 5 segundos
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Avançar mais 5 segundos
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  it('chama API de abrir portão corretamente', async () => {
    const mockResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useEsp32Status());

    await act(async () => {
      await result.current.openGate();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/esp32/open', { method: 'POST' });
  });

  it('chama API de fechar portão corretamente', async () => {
    const mockResponse = { ok: true };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useEsp32Status());

    await act(async () => {
      await result.current.closeGate();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/esp32/close', { method: 'POST' });
  });

  it('trata erro de rede corretamente', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useEsp32Status());

    await waitFor(() => {
      expect(result.current.status).toBe('disconnected');
      expect(result.current.isLoading).toBe(false);
    });
  });
});
