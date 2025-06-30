
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ESP32_CONFIG, getApiUrl } from '@/config/esp32Config';

export interface Esp32Status {
  status: 'connected' | 'disconnected' | 'error';
  lastHeartbeat: string | null;
  isLoading: boolean;
}

// Função helper para timeout manual
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const useEsp32Status = () => {
  const [status, setStatus] = useState<Esp32Status>({
    status: 'disconnected',
    lastHeartbeat: null,
    isLoading: false
  });

  // Função para persistir status no Supabase
  const persistStatus = useCallback(async (newStatus: Esp32Status) => {
    try {
      await supabase
        .from('esp32_status_history')
        .insert({
          device_id: 'esp32_main',
          status: newStatus.status,
          last_heartbeat: newStatus.lastHeartbeat ? new Date(newStatus.lastHeartbeat).toISOString() : null,
          is_loading: newStatus.isLoading
        });
      
      if (ESP32_CONFIG.esp32.debugMode) {
        console.log('Status persistido no Supabase:', newStatus);
      }
    } catch (error) {
      console.error('Erro ao persistir status no Supabase:', error);
    }
  }, []);

  // Função para atualizar status e persistir automaticamente
  const updateStatus = useCallback(async (newStatus: Partial<Esp32Status>) => {
    setStatus(prev => {
      const updatedStatus = { ...prev, ...newStatus };
      // Persistir de forma assíncrona sem bloquear a UI
      persistStatus(updatedStatus);
      return updatedStatus;
    });
  }, [persistStatus]);

  // Função para fazer polling do status
  const fetchStatus = useCallback(async () => {
    try {
      await updateStatus({ isLoading: true });
      
      const response = await fetchWithTimeout(
        getApiUrl('status'), 
        { method: 'GET' },
        ESP32_CONFIG.esp32.timeout
      );
      
      if (response.ok) {
        const data = await response.json();
        await updateStatus({
          status: 'connected',
          lastHeartbeat: data.lastHeartbeat || new Date().toISOString(),
          isLoading: false
        });
      } else {
        await updateStatus({
          status: 'error',
          isLoading: false
        });
      }
    } catch (error) {
      if (ESP32_CONFIG.esp32.debugMode) {
        console.error('Erro ao buscar status do ESP32:', error);
      }
      await updateStatus({
        status: 'disconnected',
        isLoading: false
      });
    }
  }, [updateStatus]);

  // Função para abrir portão
  const openGate = useCallback(async () => {
    try {
      await updateStatus({ isLoading: true });
      
      const response = await fetchWithTimeout(
        getApiUrl('open'), 
        { method: 'POST' },
        ESP32_CONFIG.esp32.timeout
      );
      
      if (response.ok) {
        await updateStatus({ isLoading: false });
        // Fazer um fetch do status após a ação
        setTimeout(fetchStatus, 1000);
      } else {
        await updateStatus({ 
          status: 'error',
          isLoading: false 
        });
      }
    } catch (error) {
      if (ESP32_CONFIG.esp32.debugMode) {
        console.error('Erro ao abrir portão:', error);
      }
      await updateStatus({
        status: 'error',
        isLoading: false
      });
    }
  }, [updateStatus, fetchStatus]);

  // Função para fechar portão
  const closeGate = useCallback(async () => {
    try {
      await updateStatus({ isLoading: true });
      
      const response = await fetchWithTimeout(
        getApiUrl('close'), 
        { method: 'POST' },
        ESP32_CONFIG.esp32.timeout
      );
      
      if (response.ok) {
        await updateStatus({ isLoading: false });
        // Fazer um fetch do status após a ação
        setTimeout(fetchStatus, 1000);
      } else {
        await updateStatus({ 
          status: 'error',
          isLoading: false 
        });
      }
    } catch (error) {
      if (ESP32_CONFIG.esp32.debugMode) {
        console.error('Erro ao fechar portão:', error);
      }
      await updateStatus({
        status: 'error',
        isLoading: false
      });
    }
  }, [updateStatus, fetchStatus]);

  // Configurar polling usando o intervalo da configuração
  useEffect(() => {
    fetchStatus(); // Buscar status inicial
    
    const interval = setInterval(fetchStatus, ESP32_CONFIG.esp32.pollingInterval);
    
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    ...status,
    openGate,
    closeGate,
    refresh: fetchStatus
  };
};
