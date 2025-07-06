
import { useState, useCallback } from 'react';

interface OfflineData {
  vehiclePlates: any[];
  accessHistory: any[];
  systemConfig: any;
  lastSync: string;
}

export const useOfflineStorage = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeStorage = useCallback(() => {
    try {
      // Verificar se já existe dados no localStorage
      const existingData = localStorage.getItem('offline_system_data');
      if (!existingData) {
        const initialData: OfflineData = {
          vehiclePlates: [],
          accessHistory: [],
          systemConfig: {},
          lastSync: new Date().toISOString(),
        };
        localStorage.setItem('offline_system_data', JSON.stringify(initialData));
      }
      setIsInitialized(true);
      console.log('✅ Sistema offline inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar armazenamento offline:', error);
    }
  }, []);

  const exportData = useCallback(() => {
    try {
      const data = localStorage.getItem('offline_system_data');
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_sistema_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('✅ Dados exportados com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
    }
  }, []);

  const importData = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          const data = JSON.parse(jsonData);
          localStorage.setItem('offline_system_data', jsonData);
          console.log('✅ Dados importados com sucesso');
          resolve();
        } catch (error) {
          console.error('❌ Erro ao importar dados:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, []);

  const clearAllData = useCallback(() => {
    try {
      localStorage.removeItem('offline_system_data');
      localStorage.removeItem('vehicle_plates');
      localStorage.removeItem('access_history');
      console.log('✅ Todos os dados foram limpos');
      initializeStorage();
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }, [initializeStorage]);

  return {
    isInitialized,
    initializeStorage,
    exportData,
    importData,
    clearAllData,
  };
};
