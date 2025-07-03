
import { render, screen, waitFor } from '@testing-library/react';
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

// Componente de teste para usar o hook
const TestComponent = () => {
  const { status, lastHeartbeat, isLoading, openGate, closeGate, refresh } = useEsp32Status();
  
  return (
    <div>
      <div data-testid="status">{status.connected ? 'connected' : 'disconnected'}</div>
      <div data-testid="lastHeartbeat">{lastHeartbeat || 'null'}</div>
      <div data-testid="isLoading">{isLoading ? 'true' : 'false'}</div>
      <button data-testid="openGate" onClick={openGate}>Open Gate</button>
      <button data-testid="closeGate" onClick={closeGate}>Close Gate</button>
      <button data-testid="refresh" onClick={refresh}>Refresh</button>
    </div>
  );
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('useEsp32Status Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicializa com estado padrão', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Connection failed'));
    
    renderWithQueryClient(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
      expect(screen.getByTestId('lastHeartbeat')).toHaveTextContent('null');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
  });

  it('possui funções de controle do portão', () => {
    renderWithQueryClient(<TestComponent />);

    expect(screen.getByTestId('openGate')).toBeInTheDocument();
    expect(screen.getByTestId('closeGate')).toBeInTheDocument();
    expect(screen.getByTestId('refresh')).toBeInTheDocument();
  });

  it('testa função openGate', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    renderWithQueryClient(<TestComponent />);

    const openButton = screen.getByTestId('openGate');
    openButton.click();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('testa função closeGate', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    renderWithQueryClient(<TestComponent />);

    const closeButton = screen.getByTestId('closeGate');
    closeButton.click();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
