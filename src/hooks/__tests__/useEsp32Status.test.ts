
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import 'whatwg-fetch';
import { useEsp32Status } from '../useEsp32Status';

// Mock do Supabase com tipagem correta
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

// Configurar o mock para retornar o formato esperado
mockInsert.mockResolvedValue({ 
  data: [], 
  error: null 
});

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
  });

  it('possui funções de controle do portão', () => {
    const { result } = renderHook(() => useEsp32Status());

    expect(typeof result.current.openGate).toBe('function');
    expect(typeof result.current.closeGate).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('testa função refresh com sucesso', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({ lastHeartbeat: new Date().toISOString() })
    } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useEsp32Status());

    await act(async () => {
      result.current.refresh();
      await waitForNextUpdate();
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.status).toBe('connected');
  });

  it('testa função refresh com erro', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

    const { result, waitForNextUpdate } = renderHook(() => useEsp32Status());

    await act(async () => {
      result.current.refresh();
      await waitForNextUpdate();
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.status).toBe('disconnected');
  });

  it('testa polling com timers falsos', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({ lastHeartbeat: new Date().toISOString() })
    } as Response);

    const { result, waitForNextUpdate } = renderHook(() => useEsp32Status());

    // Aguarda a primeira chamada
    await act(async () => {
      await waitForNextUpdate();
    });

    const initialCallCount = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls.length;

    // Avança os timers para simular o polling
    await act(async () => {
      jest.advanceTimersByTime(30000); // 30 segundos
      await waitForNextUpdate();
    });

    expect((global.fetch as jest.MockedFunction<typeof fetch>).mock.calls.length).toBeGreaterThan(initialCallCount);
  });
});
