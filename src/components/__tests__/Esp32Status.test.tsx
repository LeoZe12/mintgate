
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { Esp32Status } from '../Esp32Status';

// Mock do hook useEsp32Status
const mockUseEsp32Status = jest.fn();

jest.mock('@/hooks/useEsp32Status', () => ({
  useEsp32Status: () => mockUseEsp32Status()
}));

describe('Esp32Status Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEsp32Status.mockReturnValue({
      status: 'disconnected',
      lastHeartbeat: null,
      isLoading: false,
      openGate: jest.fn(),
      closeGate: jest.fn(),
      refresh: jest.fn()
    });
  });

  it('renderiza sem erros', () => {
    const { container } = render(<Esp32Status />);
    expect(container).toBeInTheDocument();
  });

  it('exibe status desconectado por padrão', () => {
    const { getByText } = render(<Esp32Status />);
    expect(getByText('Desconectado')).toBeInTheDocument();
  });

  it('exibe último heartbeat como "Nunca" quando null', () => {
    const { getByText } = render(<Esp32Status />);
    expect(getByText('Nunca')).toBeInTheDocument();
  });

  it('desabilita botões quando desconectado', () => {
    const { getByText } = render(<Esp32Status />);
    const openButton = getByText('Abrir Portão');
    const closeButton = getByText('Fechar Portão');
    
    expect(openButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });
});
