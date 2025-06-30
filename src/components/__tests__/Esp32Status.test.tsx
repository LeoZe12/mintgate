
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { Esp32Status } from '../Esp32Status';

// Mock do hook useEsp32Status
const mockUseEsp32Status = {
  status: 'connected' as const,
  lastHeartbeat: '2024-01-01T12:00:00Z',
  isLoading: false,
  openGate: jest.fn(),
  closeGate: jest.fn(),
  refresh: jest.fn()
};

jest.mock('@/hooks/useEsp32Status', () => ({
  useEsp32Status: () => mockUseEsp32Status
}));

describe('Esp32Status Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o componente corretamente', () => {
    render(<Esp32Status />);
    
    expect(screen.getByText('Status ESP32')).toBeInTheDocument();
    expect(screen.getByText('Conectado')).toBeInTheDocument();
    expect(screen.getByText('Abrir Portão')).toBeInTheDocument();
    expect(screen.getByText('Fechar Portão')).toBeInTheDocument();
  });

  it('chama função openGate quando botão é clicado', async () => {
    render(<Esp32Status />);
    
    const openButton = screen.getByText('Abrir Portão');
    fireEvent.click(openButton);
    
    expect(mockUseEsp32Status.openGate).toHaveBeenCalledTimes(1);
  });

  it('chama função closeGate quando botão é clicado', async () => {
    render(<Esp32Status />);
    
    const closeButton = screen.getByText('Fechar Portão');
    fireEvent.click(closeButton);
    
    expect(mockUseEsp32Status.closeGate).toHaveBeenCalledTimes(1);
  });

  it('desabilita botões quando status é disconnected', () => {
    const disconnectedMock = {
      ...mockUseEsp32Status,
      status: 'disconnected' as const
    };
    
    jest.mocked(require('@/hooks/useEsp32Status').useEsp32Status).mockReturnValue(disconnectedMock);
    
    render(<Esp32Status />);
    
    const openButton = screen.getByText('Abrir Portão');
    const closeButton = screen.getByText('Fechar Portão');
    
    expect(openButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });
});
