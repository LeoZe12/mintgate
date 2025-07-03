
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ESP32_CONFIG } from '@/config/esp32Config';
import { supabase } from '@/integrations/supabase/client';

export interface Esp32Status {
  connected: boolean;
  lastHeartbeat?: string;
  isLoading?: boolean;
}

export const useEsp32Status = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['esp32-status'],
    queryFn: async (): Promise<Esp32Status> => {
      try {
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
          
          // Log to Supabase
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
