
import { Esp32ConfigType } from './schema';

// Configuração específica para desenvolvimento
export const DEV_CONFIG: Partial<Esp32ConfigType> = {
  esp32: {
    debugMode: true,
    pollingInterval: 2000, // Polling mais frequente em dev
  },
  
  ui: {
    showDebugInfo: true,
    refreshRate: 500, // UI mais responsiva em dev
  },
};
