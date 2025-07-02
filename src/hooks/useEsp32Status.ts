
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
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ESP32_CONFIG.esp32.timeout);

        const response = await fetch(
          `http://${ESP32_CONFIG.esp32.ipAddress}:${ESP32_CONFIG.esp32.port}${ESP32_CONFIG.api.endpoints.status}`,
          {
            method: 'GET',
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

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
        } else {
          return { connected: false };
        }
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ESP32_CONFIG.esp32.timeout);

      await fetch(
        `http://${ESP32_CONFIG.esp32.ipAddress}:${ESP32_CONFIG.esp32.port}${ESP32_CONFIG.api.endpoints.openGate}`,
        {
          method: 'POST',
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log('Gate opened successfully');
    } catch (error) {
      console.error('Error opening gate:', error);
    }
  };

  const closeGate = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ESP32_CONFIG.esp32.timeout);

      await fetch(
        `http://${ESP32_CONFIG.esp32.ipAddress}:${ESP32_CONFIG.esp32.port}${ESP32_CONFIG.api.endpoints.closeGate}`,
        {
          method: 'POST',
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log('Gate closed successfully');
    } catch (error) {
      console.error('Error closing gate:', error);
    }
  };

  const refresh = () => {
    refetch();
  };

  return {
    status,
    lastHeartbeat,
    isLoading,
    error,
    openGate,
    closeGate,
    refresh,
  };
};
