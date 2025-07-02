
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
      status: { connected: false },
      isLoading: false,
      error: null
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

  it('exibe status conectado quando conectado', () => {
    mockUseEsp32Status.mockReturnValue({
      status: { connected: true, lastHeartbeat: new Date().toISOString() },
      isLoading: false,
      error: null
    });

    const { getByText } = render(<Esp32Status />);
    expect(getByText('Conectado')).toBeInTheDocument();
  });

  it('exibe loading quando carregando', () => {
    mockUseEsp32Status.mockReturnValue({
      status: null,
      isLoading: true,
      error: null
    });

    const { getByText } = render(<Esp32Status />);
    expect(getByText('Verificando conexão...')).toBeInTheDocument();
  });
});
