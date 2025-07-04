import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import 'whatwg-fetch';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useEsp32Status Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicializa com estado padrão', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Connection failed'));
    
    const { result } = renderHook(() => useEsp32Status(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.status.connected).toBe(false);
      expect(result.current.lastHeartbeat).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('possui funções de controle do portão', () => {
    const { result } = renderHook(() => useEsp32Status(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.openGate).toBe('function');
    expect(typeof result.current.closeGate).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('testa função openGate', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    const { result } = renderHook(() => useEsp32Status(), {
      wrapper: createWrapper(),
    });

    await result.current.openGate();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('testa função closeGate', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    const { result } = renderHook(() => useEsp32Status(), {
      wrapper: createWrapper(),
    });

    await result.current.closeGate();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
