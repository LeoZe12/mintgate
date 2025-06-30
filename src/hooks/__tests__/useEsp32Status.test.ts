
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
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

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
    } as any;
    
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useEsp32Status());

    await waitFor(() => {
      expect(result.current.status).toBe('connected');
    });

    expect(result.current.lastHeartbeat).toBe('2024-01-01T12:00:00Z');
    expect(result.current.isLoading).toBe(false);
  });

  it('chama API de abrir portão corretamente', async () => {
    const mockResponse = { ok: true } as any;
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useEsp32Status());

    await act(async () => {
      await result.current.openGate();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/esp32/open', { method: 'POST' });
  });
});
