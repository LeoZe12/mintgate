
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Esp32Status from '../Esp32Status';

// Mock do hook useEsp32Status
jest.mock('@/hooks/useEsp32Status', () => ({
  useEsp32Status: jest.fn(() => ({
    status: { connected: false, lastHeartbeat: null },
    lastHeartbeat: null,
    isLoading: false,
    error: null,
    openGate: jest.fn(),
    closeGate: jest.fn(),
    refresh: jest.fn(),
  }))
}));

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

describe('Esp32Status Component', () => {
  it('renderiza corretamente quando desconectado', () => {
    renderWithQueryClient(<Esp32Status />);
    
    expect(screen.getByText('Status do ESP32')).toBeInTheDocument();
    expect(screen.getByText('Desconectado')).toBeInTheDocument();
  });

  it('possui botões de controle do portão', () => {
    renderWithQueryClient(<Esp32Status />);
    
    expect(screen.getByText('Abrir Portão')).toBeInTheDocument();
    expect(screen.getByText('Fechar Portão')).toBeInTheDocument();
    expect(screen.getByText('Atualizar')).toBeInTheDocument();
  });
});
