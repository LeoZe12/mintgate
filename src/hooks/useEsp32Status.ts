
import { useState, useEffect } from 'react';
import { ESP32_CONFIG } from '@/config/esp32Config';

export interface Esp32Status {
  connected: boolean;
  lastHeartbeat?: string;
  isLoading?: boolean;
}

export const useEsp32Status = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Verificar status do ESP32 (simulado para desenvolvimento)
  const checkStatus = async (): Promise<Esp32Status> => {
    try {
      setIsLoading(true);
      
      // Para desenvolvimento, simular status conectado após pequeno delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const heartbeat = new Date().toISOString();
      setStatus('connected');
      setLastHeartbeat(heartbeat);
      setError(null);

      return {
        connected: true,
        lastHeartbeat: heartbeat,
      };
    } catch (error) {
      console.error('ESP32 connection error:', error);
      setStatus('disconnected');
      setError(error instanceof Error ? error : new Error('Erro desconhecido'));
      
      return { connected: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Polling automático do status
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus();
    }, ESP32_CONFIG.esp32.pollingInterval);

    // Verificação inicial
    checkStatus();

    return () => clearInterval(interval);
  }, []);

  const openGate = async () => {
    try {
      // Simular abertura do portão para desenvolvimento
      console.log('🚪 Portão aberto via ESP32 (simulado)', ESP32_CONFIG.esp32.serialPort);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error opening gate:', error);
      throw error;
    }
  };

  const closeGate = async () => {
    try {
      // Simular fechamento do portão para desenvolvimento
      console.log('🚪 Portão fechado via ESP32 (simulado)', ESP32_CONFIG.esp32.serialPort);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error closing gate:', error);
      throw error;
    }
  };

  const refresh = () => {
    checkStatus();
  };

  return {
    status: { connected: status === 'connected', lastHeartbeat },
    lastHeartbeat,
    isLoading,
    error,
    openGate,
    closeGate,
    refresh,
  };
};
