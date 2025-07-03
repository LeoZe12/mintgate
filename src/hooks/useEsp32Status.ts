
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ESP32_CONFIG } from '@/config/esp32Config';
import { supabase } from '@/integrations/supabase/client';

export interface Esp32Status {
  connected: boolean;
  lastHeartbeat?: string;
  isLoading?: boolean;
}

// Simulação de comunicação serial via Web Serial API
const connectToSerial = async (): Promise<SerialPort | null> => {
  if (!navigator.serial) {
    console.warn('Web Serial API não suportada neste navegador');
    return null;
  }

  try {
    const port = await navigator.serial.requestPort();
    await port.open({ 
      baudRate: ESP32_CONFIG.esp32.baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });
    return port;
  } catch (error) {
    console.error('Erro ao conectar à porta serial:', error);
    return null;
  }
};

const sendSerialCommand = async (command: string): Promise<string | null> => {
  try {
    const port = await connectToSerial();
    if (!port) return null;

    const writer = port.writable?.getWriter();
    const reader = port.readable?.getReader();
    
    if (!writer || !reader) {
      console.error('Não foi possível obter writer/reader da porta serial');
      return null;
    }

    // Enviar comando
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(command + '\n'));
    writer.releaseLock();

    // Ler resposta
    const { value } = await reader.read();
    reader.releaseLock();
    
    await port.close();
    
    const decoder = new TextDecoder();
    return decoder.decode(value);
  } catch (error) {
    console.error('Erro na comunicação serial:', error);
    return null;
  }
};

export const useEsp32Status = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['esp32-status'],
    queryFn: async (): Promise<Esp32Status> => {
      try {
        // Tentar comunicação serial
        const response = await sendSerialCommand('STATUS');
        
        if (response && response.includes('OK')) {
          const heartbeat = new Date().toISOString();
          
          // Log to Supabase
          await supabase.from('esp32_status_history').insert({
            status: 'connected',
            last_heartbeat: heartbeat,
            is_loading: false
          });

          return {
            connected: true,
            lastHeartbeat: heartbeat,
          };
        } else {
          // Fallback para comunicação via API local (caso tenha um servidor bridge)
          const fallbackResponse = await fetch('http://localhost:3001/esp32/status', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            const heartbeat = new Date().toISOString();
            
            await supabase.from('esp32_status_history').insert({
              status: 'connected',
              last_heartbeat: heartbeat,
              is_loading: false
            });

            return {
              connected: true,
              lastHeartbeat: heartbeat,
              ...data
            };
          }
        }
        
        return { connected: false };
      } catch (error) {
        console.error('ESP32 connection error:', error);
        
        // Log error to Supabase
        await supabase.from('esp32_status_history').insert({
          status: 'disconnected',
          last_heartbeat: null,
          is_loading: false
        });

        return { connected: false };
      }
    },
    refetchInterval: ESP32_CONFIG.esp32.pollingInterval,
    retry: ESP32_CONFIG.esp32.maxRetries,
  });

  useEffect(() => {
    if (data) {
      setStatus(data.connected ? 'connected' : 'disconnected');
      if (data.lastHeartbeat) {
        setLastHeartbeat(data.lastHeartbeat);
      }
    }
  }, [data]);

  const openGate = async () => {
    try {
      // Tentar comando serial primeiro
      const serialResponse = await sendSerialCommand('OPEN_GATE');
      
      if (!serialResponse || !serialResponse.includes('OK')) {
        // Fallback para API local
        await fetch('http://localhost:3001/esp32/open', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      console.log('Gate opened successfully');
    } catch (error) {
      console.error('Error opening gate:', error);
    }
  };

  const closeGate = async () => {
    try {
      // Tentar comando serial primeiro
      const serialResponse = await sendSerialCommand('CLOSE_GATE');
      
      if (!serialResponse || !serialResponse.includes('OK')) {
        // Fallback para API local
        await fetch('http://localhost:3001/esp32/close', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      console.log('Gate closed successfully');
    } catch (error) {
      console.error('Error closing gate:', error);
    }
  };

  const refresh = () => {
    refetch();
  };

  return {
    status: data || { connected: status === 'connected', lastHeartbeat },
    lastHeartbeat,
    isLoading,
    error,
    openGate,
    closeGate,
    refresh,
  };
};
