
/**
 * Configuração centralizada do ESP32
 * Modifique este arquivo para alterar todas as configurações do sistema
 */

export interface Esp32ConfigType {
  // Configurações do ESP32
  esp32: {
    ipAddress: string;
    port: string;
    maxRetries: number;
    timeout: number;
    pollingInterval: number;
    autoReconnect: boolean;
    debugMode: boolean;
  };
  
  // Configurações das Portas GPIO
  gpio: {
    externalLoopPort: string;
    internalLoopPort: string;
    gateControlPort: string;
  };
  
  // Configurações da Câmera
  camera: {
    url: string;
    streamFormat: 'mjpeg' | 'rtsp' | 'http';
    quality: 'low' | 'medium' | 'high';
    fps: number;
  };
  
  // Configurações do PlatRecognizer
  platRecognizer: {
    apiKey: string;
    licenseKey: string;
    apiUrl: string;
    confidenceThreshold: number;
    regions: string[];
  };
  
  // Configurações da API
  api: {
    baseUrl: string;
    endpoints: {
      status: string;
      open: string;
      close: string;
      config: string;
    };
  };
  
  // Configurações da Interface
  ui: {
    theme: 'light' | 'dark';
    refreshRate: number;
    showDebugInfo: boolean;
    language: 'pt-BR' | 'en-US';
  };
}

// Configuração padrão - MODIFIQUE AQUI PARA ALTERAR TODO O SISTEMA
export const ESP32_CONFIG: Esp32ConfigType = {
  esp32: {
    ipAddress: '192.168.1.100',
    port: '80',
    maxRetries: 3,
    timeout: 5000,
    pollingInterval: 5000,
    autoReconnect: true,
    debugMode: false,
  },
  
  gpio: {
    externalLoopPort: '2',
    internalLoopPort: '3',
    gateControlPort: '4',
  },
  
  camera: {
    url: 'http://192.168.1.101:8080/video',
    streamFormat: 'mjpeg',
    quality: 'medium',
    fps: 30,
  },
  
  platRecognizer: {
    apiKey: '',
    licenseKey: '',
    apiUrl: 'https://api.platerecognizer.com/v1/plate-reader/',
    confidenceThreshold: 0.8,
    regions: ['br'], // Brasil
  },
  
  api: {
    baseUrl: '/api/esp32',
    endpoints: {
      status: '/status',
      open: '/open',
      close: '/close',
      config: '/config',
    },
  },
  
  ui: {
    theme: 'light',
    refreshRate: 1000,
    showDebugInfo: false,
    language: 'pt-BR',
  },
};

// Função para obter a URL completa da API
export const getApiUrl = (endpoint: keyof typeof ESP32_CONFIG.api.endpoints): string => {
  return `${ESP32_CONFIG.api.baseUrl}${ESP32_CONFIG.api.endpoints[endpoint]}`;
};

// Função para obter a URL completa do ESP32
export const getEsp32Url = (path: string = ''): string => {
  return `http://${ESP32_CONFIG.esp32.ipAddress}:${ESP32_CONFIG.esp32.port}${path}`;
};

// Função para validar configurações
export const validateConfig = (config: Esp32ConfigType): boolean => {
  // Validar IP
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(config.esp32.ipAddress)) {
    console.error('IP do ESP32 inválido');
    return false;
  }
  
  // Validar porta
  const port = parseInt(config.esp32.port);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('Porta do ESP32 inválida');
    return false;
  }
  
  // Validar URL da câmera
  try {
    new URL(config.camera.url);
  } catch {
    console.error('URL da câmera inválida');
    return false;
  }
  
  return true;
};
