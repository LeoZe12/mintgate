
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

  // Verificar status do ESP32 via USB/Serial
  const checkStatus = async (): Promise<Esp32Status> => {
    try {
      setIsLoading(true);
      
      // Comunicação via API local (servidor bridge que se comunica com ESP32 via serial)
      const response = await fetch(`http://localhost:3001/esp32/status?port=${ESP32_CONFIG.esp32.serialPort}&baud=${ESP32_CONFIG.esp32.baudRate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(ESP32_CONFIG.esp32.timeout),
      });

      if (response.ok) {
        const data = await response.json();
        const heartbeat = new Date().toISOString();
        
        setStatus('connected');
        setLastHeartbeat(heartbeat);
        setError(null);

        return {
          connected: true,
          lastHeartbeat: heartbeat,
          ...data
        };
      }
      
      setStatus('disconnected');
      return { connected: false };
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
      await fetch(`http://localhost:3001/esp32/open?port=${ESP32_CONFIG.esp32.serialPort}&baud=${ESP32_CONFIG.esp32.baudRate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(ESP32_CONFIG.esp32.timeout),
      });

      console.log('Gate opened successfully via serial port', ESP32_CONFIG.esp32.serialPort);
    } catch (error) {
      console.error('Error opening gate:', error);
      throw error;
    }
  };

  const closeGate = async () => {
    try {
      await fetch(`http://localhost:3001/esp32/close?port=${ESP32_CONFIG.esp32.serialPort}&baud=${ESP32_CONFIG.esp32.baudRate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(ESP32_CONFIG.esp32.timeout),
      });

      console.log('Gate closed successfully via serial port', ESP32_CONFIG.esp32.serialPort);
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
