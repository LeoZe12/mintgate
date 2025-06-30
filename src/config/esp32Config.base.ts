
import { Esp32ConfigType } from './schema';

// Configuração base - valores padrão que são compartilhados entre ambientes
export const BASE_CONFIG: Esp32ConfigType = {
  esp32: {
    ipAddress: '192.168.1.100',
    port: 80,
    maxRetries: 3,
    timeout: 5000,
    pollingInterval: 5000,
    autoReconnect: true,
    debugMode: false,
  },
  
  gpio: {
    externalLoopPort: 2,
    internalLoopPort: 3,
    gateControlPort: 4,
  },
  
  camera: {
    url: 'http://192.168.1.101:8080/video',
    streamFormat: 'mjpeg',
    quality: 'medium',
    fps: 30,
  },
  
  platRecognizer: {
    apiKey: process.env.PLATERECOGNIZER_API_KEY || '',
    licenseKey: process.env.PLATERECOGNIZER_LICENSE_KEY || '',
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
