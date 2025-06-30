
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { Esp32Status } from '../Esp32Status';
import * as useEsp32StatusModule from '../../hooks/useEsp32Status';

// Mock do hook
const mockUseEsp32Status = jest.fn();
jest.mock('../../hooks/useEsp32Status', () => ({
  useEsp32Status: mockUseEsp32Status
}));

// Mock do Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}));

// Mock dos componentes UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}));

describe('Esp32Status Component', () => {
  const mockOpenGate = jest.fn();
  const mockCloseGate = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza status conectado corretamente', () => {
    mockUseEsp32Status.mockReturnValue({
      status: 'connected',
      lastHeartbeat: '2024-01-01T12:00:00Z',
      isLoading: false,
      openGate: mockOpenGate,
      closeGate: mockCloseGate,
      refresh: mockRefresh
    });

    render(<Esp32Status />);

    expect(screen.getByText('Status ESP32')).toBeInTheDocument();
    expect(screen.getByText('Conectado')).toBeInTheDocument();
    expect(screen.getByText('01/01/2024, 12:00:00')).toBeInTheDocument();
    expect(screen.getByText('Abrir Portão')).toBeInTheDocument();
    expect(screen.getByText('Fechar Portão')).toBeInTheDocument();
  });

  it('renderiza status desconectado corretamente', () => {
    mockUseEsp32Status.mockReturnValue({
      status: 'disconnected',
      lastHeartbeat: null,
      isLoading: false,
      openGate: mockOpenGate,
      closeGate: mockCloseGate,
      refresh: mockRefresh
    });

    render(<Esp32Status />);

    expect(screen.getByText('Desconectado')).toBeInTheDocument();
    expect(screen.getByText('Nunca')).toBeInTheDocument();
    
    // Botões devem estar desabilitados quando desconectado
    const openButton = screen.getByText('Abrir Portão');
    const closeButton = screen.getByText('Fechar Portão');
    
    expect(openButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it('renderiza estado de loading corretamente', () => {
    mockUseEsp32Status.mockReturnValue({
      status: 'connected',
      lastHeartbeat: '2024-01-01T12:00:00Z',
      isLoading: true,
      openGate: mockOpenGate,
      closeGate: mockCloseGate,
      refresh: mockRefresh
    });

    render(<Esp32Status />);

    // Botões devem estar desabilitados durante loading
    const openButton = screen.getByText('Abrir Portão');
    const closeButton = screen.getByText('Fechar Portão');
    
    expect(openButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it('chama openGate quando botão Abrir Portão é clicado', async () => {
    mockUseEsp32Status.mockReturnValue({
      status: 'connected',
      lastHeartbeat: '2024-01-01T12:00:00Z',
      isLoading: false,
      openGate: mockOpenGate,
      closeGate: mockCloseGate,
      refresh: mockRefresh
    });

    render(<Esp32Status />);

    const openButton = screen.getByText('Abrir Portão');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(mockOpenGate).toHaveBeenCalledTimes(1);
    });
  });

  it('chama closeGate quando botão Fechar Portão é clicado', async () => {
    mockUseEsp32Status.mockReturnValue({
      status: 'connected',
      lastHeartbeat: '2024-01-01T12:00:00Z',
      isLoading: false,
      openGate: mockOpenGate,
      closeGate: mockCloseGate,
      refresh: mockRefresh
    });

    render(<Esp32Status />);

    const closeButton = screen.getByText('Fechar Portão');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockCloseGate).toHaveBeenCalledTimes(1);
    });
  });

  it('chama refresh quando botão Atualizar Status é clicado', async () => {
    mockUseEsp32Status.mockReturnValue({
      status: 'connected',
      lastHeartbeat: '2024-01-01T12:00:00Z',
      isLoading: false,
      openGate: mockOpenGate,
      closeGate: mockCloseGate,
      refresh: mockRefresh
    });

    render(<Esp32Status />);

    const refreshButton = screen.getByText('Atualizar Status');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('renderiza status de erro corretamente', () => {
    mockUseEsp32Status.mockReturnValue({
      status: 'error',
      lastHeartbeat: '2024-01-01T12:00:00Z',
      isLoading: false,
      openGate: mockOpenGate,
      closeGate: mockCloseGate,
      refresh: mockRefresh
    });

    render(<Esp32Status />);

    expect(screen.getByText('Erro')).toBeInTheDocument();
    
    // Botões devem estar desabilitados em caso de erro
    const openButton = screen.getByText('Abrir Portão');
    const closeButton = screen.getByText('Fechar Portão');
    
    expect(openButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });
});
