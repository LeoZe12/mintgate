
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { useEsp32Status } from '../useEsp32Status';

// Mock do Supabase com tipagem correta
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

// Configurar o mock para retornar o formato esperado
mockInsert.mockResolvedValue({ 
  data: null, 
  error: null 
} as any);

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
});
