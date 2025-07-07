import { Esp32ConfigType } from './schema';

// Configuração base - valores padrão que são compartilhados entre ambientes
export const BASE_CONFIG: Esp32ConfigType = {
  esp32: {
    serialPort: 'COM3',
    baudRate: 115200,
    maxRetries: 3,
    timeout: 5000,
    pollingInterval: 5000,
    autoReconnect: true,
    debugMode: true,
  },
  
  gpio: {
    externalLoopPort: 2,
    internalLoopPort: 3,
    gateControlPort: 4,
  },
  
  camera: {
    url: 'rtsp://admin:Leoze0607@192.168.0.10:554/Streaming/Channels/101',
    streamFormat: 'rtsp',
    quality: 'medium',
    fps: 30,
  },
  
  platRecognizer: {
    apiKey: 'demo_api_key_replace_with_real',
    licenseKey: 'demo_license_key_replace_with_real',
    apiUrl: 'https://api.platerecognizer.com/v1/plate-reader/',
    confidenceThreshold: 0.8,
    regions: ['br'], // Brasil
  },
  
  platRecognizerOffline: {
    enabled: true,
    endpoint: 'http://localhost:8080/v1/plate-reader/',
    licenseKey: 'TrHEk9pKez',
    apiToken: '3c545cd3eddd8323e580b39f8c0aaead7935f62c',
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
