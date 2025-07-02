
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ESP32_CONFIG } from '@/config/esp32Config';

export interface Esp32Status {
  connected: boolean;
  lastHeartbeat?: string;
  isLoading?: boolean;
}

export const useEsp32Status = () => {
  const [status, setStatus] = useState<Esp32Status>({ connected: false });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['esp32-status'],
    queryFn: async (): Promise<Esp32Status> => {
      try {
        const response = await fetch(
          `http://${ESP32_CONFIG.esp32.ipAddress}:${ESP32_CONFIG.esp32.port}${ESP32_CONFIG.api.endpoints.status}`,
          {
            method: 'GET',
            timeout: ESP32_CONFIG.esp32.timeout,
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            connected: true,
            lastHeartbeat: new Date().toISOString(),
            ...data
          };
        } else {
          return { connected: false };
        }
      } catch (error) {
        console.error('ESP32 connection error:', error);
        return { connected: false };
      }
    },
    refetchInterval: ESP32_CONFIG.esp32.pollingInterval,
    retry: ESP32_CONFIG.esp32.maxRetries,
  });

  useEffect(() => {
    if (data) {
      setStatus(data);
    }
  }, [data]);

  return {
    status: data || status,
    isLoading,
    error,
    refetch,
  };
};
