
import { Esp32ConfigType } from './schema';

// Configuração específica para produção
export const PROD_CONFIG: Partial<Esp32ConfigType> = {
  esp32: {
    debugMode: false,
    pollingInterval: 10000, // Polling menos frequente em prod
    timeout: 8000, // Timeout maior em prod
  },
  
  ui: {
    showDebugInfo: false,
    refreshRate: 2000, // UI menos frequente em prod
  },
};
