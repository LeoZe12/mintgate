
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface AccessHistory {
  id: string;
  plate: string;
  apartment_number?: string;
  access_granted: boolean;
  image_url?: string;
  confidence_score?: number;
  timestamp: string;
  reason?: string;
}

export interface AccessHistoryInsert {
  plate: string;
  apartment_number?: string;
  access_granted: boolean;
  image_url?: string;
  confidence_score?: number;
  reason?: string;
}

export const useAccessHistory = () => {
  const [accessHistory, setAccessHistory] = useLocalStorage<AccessHistory[]>('access_history', []);
  const [isLoading, setIsLoading] = useState(false);

  // Função para salvar histórico em arquivo .txt
  const saveToTextFile = useCallback((data: AccessHistory[], filename: string = 'historico_acessos.txt') => {
    const content = data.map(access => 
      `ID: ${access.id}\n` +
      `Placa: ${access.plate}\n` +
      `Apartamento: ${access.apartment_number || 'N/A'}\n` +
      `Acesso: ${access.access_granted ? 'AUTORIZADO' : 'NEGADO'}\n` +
      `Confiança: ${access.confidence_score ? (access.confidence_score * 100).toFixed(1) + '%' : 'N/A'}\n` +
      `Data/Hora: ${new Date(access.timestamp).toLocaleString('pt-BR')}\n` +
      `Motivo: ${access.reason || 'N/A'}\n` +
      `${'='.repeat(50)}\n`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const logAccess = useCallback(async (accessData: AccessHistoryInsert): Promise<AccessHistory> => {
    setIsLoading(true);
    try {
      const access: AccessHistory = {
        id: Date.now().toString(),
        ...accessData,
        plate: accessData.plate.toUpperCase(),
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [access, ...accessHistory];
      setAccessHistory(updatedHistory);
      saveToTextFile(updatedHistory);
      
      return access;
    } finally {
      setIsLoading(false);
    }
  }, [accessHistory, setAccessHistory, saveToTextFile]);

  const getHistoryByApartment = useCallback(async (apartmentNumber: string): Promise<AccessHistory[]> => {
    return accessHistory.filter(access => access.apartment_number === apartmentNumber);
  }, [accessHistory]);

  const refetch = useCallback(async () => {
    return Promise.resolve();
  }, []);

  return {
    accessHistory: accessHistory.slice(0, 100), // Limitar a 100 registros mais recentes
    isLoading,
    error: null,
    refetch,
    logAccess,
    getHistoryByApartment,
    isLoggingAccess: isLoading,
    saveToTextFile: () => saveToTextFile(accessHistory),
  };
};
