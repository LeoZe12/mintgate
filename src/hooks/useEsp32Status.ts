
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Esp32Status {
  status: 'connected' | 'disconnected' | 'error';
  lastHeartbeat: string | null;
  isLoading: boolean;
}

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
      
      const response = await fetch('/api/esp32/status');
      
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
      console.error('Erro ao buscar status do ESP32:', error);
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
      
      const response = await fetch('/api/esp32/open', { method: 'POST' });
      
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
      console.error('Erro ao abrir portão:', error);
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
      
      const response = await fetch('/api/esp32/close', { method: 'POST' });
      
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
      console.error('Erro ao fechar portão:', error);
      await updateStatus({
        status: 'error',
        isLoading: false
      });
    }
  }, [updateStatus, fetchStatus]);

  // Configurar polling a cada 5 segundos
  useEffect(() => {
    fetchStatus(); // Buscar status inicial
    
    const interval = setInterval(fetchStatus, 5000);
    
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    ...status,
    openGate,
    closeGate,
    refresh: fetchStatus
  };
};
