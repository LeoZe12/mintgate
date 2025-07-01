
import merge from 'lodash/merge';
import { validateConfig } from './schema';
import { BASE_CONFIG } from './esp32Config.base';
import { DEV_CONFIG } from './esp32Config.dev';
import { PROD_CONFIG } from './esp32Config.prod';
import type { Esp32ConfigType } from './schema';

// Função para determinar o ambiente
const getEnvironment = (): 'development' | 'production' => {
  // No frontend, usamos import.meta.env ao invés de process.env
  return import.meta.env.MODE === 'production' ? 'production' : 'development';
};

// Função para criar configuração baseada no ambiente
const createConfig = (): Esp32ConfigType => {
  const environment = getEnvironment();
  
  let config = BASE_CONFIG;
  
  // Aplicar overrides específicos do ambiente
  switch (environment) {
    case 'development':
      config = merge({}, BASE_CONFIG, DEV_CONFIG);
      break;
    case 'production':
      config = merge({}, BASE_CONFIG, PROD_CONFIG);
      break;
  }
  
  // Validar configuração final
  return validateConfig(config);
};

// Configuração final validada
export const ESP32_CONFIG = createConfig();

// Re-exportar tipos para compatibilidade
export type { Esp32ConfigType };

// Função para obter a URL completa da API
export const getApiUrl = (endpoint: keyof typeof ESP32_CONFIG.api.endpoints): string => {
  return `${ESP32_CONFIG.api.baseUrl}${ESP32_CONFIG.api.endpoints[endpoint]}`;
};

// Função para obter a URL completa do ESP32
export const getEsp32Url = (path: string = ''): string => {
  return `http://${ESP32_CONFIG.esp32.ipAddress}:${ESP32_CONFIG.esp32.port}${path}`;
};

// Função para validar configurações (compatibilidade)
export const validateConfiguration = (config: Esp32ConfigType): boolean => {
  try {
    validateConfig(config);
    return true;
  } catch (error) {
    console.error('Erro de validação:', error);
    return false;
  }
};

// Função para atualizar configuração em runtime
export const updateConfig = (updates: Partial<Esp32ConfigType>): Esp32ConfigType => {
  const newConfig = merge({}, ESP32_CONFIG, updates);
  return validateConfig(newConfig);
};

// Função para resetar configuração para padrões
export const resetConfig = (): Esp32ConfigType => {
  return validateConfig(BASE_CONFIG);
};

// Log da configuração carregada em modo debug
if (ESP32_CONFIG.esp32.debugMode) {
  console.log('🔧 Configuração ESP32 carregada:', {
    environment: getEnvironment(),
    ip: ESP32_CONFIG.esp32.ipAddress,
    port: ESP32_CONFIG.esp32.port,
    camera: ESP32_CONFIG.camera.url,
    gpio: ESP32_CONFIG.gpio,
    hasApiKey: !!ESP32_CONFIG.platRecognizer.apiKey,
    hasLicenseKey: !!ESP32_CONFIG.platRecognizer.licenseKey,
  });
}
