
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import 'whatwg-fetch';
import { useEsp32Status } from '../useEsp32Status';

// Mock do Supabase com tipagem correta
const mockInsert = jest.fn() as jest.MockedFunction<any>;
mockInsert.mockResolvedValue({ 
  data: [], 
  error: null 
});
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom
  }
}));

// Mock do fetch global
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock do @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn()
  }))
}));

describe('useEsp32Status Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('testa função refresh', () => {
    const { result } = renderHook(() => useEsp32Status());

    act(() => {
      result.current.refresh();
    });

    expect(typeof result.current.refresh).toBe('function');
  });

  it('testa função openGate', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    const { result } = renderHook(() => useEsp32Status());

    await act(async () => {
      await result.current.openGate();
    });

    expect(global.fetch).toHaveBeenCalled();
  });

  it('testa função closeGate', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    const { result } = renderHook(() => useEsp32Status());

    await act(async () => {
      await result.current.closeGate();
    });

    expect(global.fetch).toHaveBeenCalled();
  });
});
