import { Esp32ConfigType } from './schema';

// Configuração base - valores padrão que são compartilhados entre ambientes
export const BASE_CONFIG: Esp32ConfigType = {
  esp32: {
    serialPort: import.meta.env.VITE_ESP32_SERIAL_PORT || 'COM3',
    baudRate: parseInt(import.meta.env.VITE_ESP32_BAUD_RATE) || 115200,
    maxRetries: parseInt(import.meta.env.VITE_MAX_RETRIES) || 3,
    timeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || 5000,
    pollingInterval: parseInt(import.meta.env.VITE_POLLING_INTERVAL) || 5000,
    autoReconnect: true,
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },
  
  gpio: {
    externalLoopPort: parseInt(import.meta.env.VITE_GPIO_EXTERNAL_LOOP) || 2,
    internalLoopPort: parseInt(import.meta.env.VITE_GPIO_INTERNAL_LOOP) || 3,
    gateControlPort: parseInt(import.meta.env.VITE_GPIO_GATE_CONTROL) || 4,
  },
  
  camera: {
    url: import.meta.env.VITE_CAMERA_URL || 'rtsp://admin:Leoze0607@192.168.0.10:554/Streaming/Channels/101',
    streamFormat: 'rtsp',
    quality: 'medium',
    fps: 30,
  },
  
  platRecognizer: {
    apiKey: import.meta.env.VITE_PLATERECOGNIZER_API_KEY || 'demo_api_key_replace_with_real',
    licenseKey: import.meta.env.VITE_PLATERECOGNIZER_LICENSE_KEY || 'demo_license_key_replace_with_real',
    apiUrl: 'https://api.platerecognizer.com/v1/plate-reader/',
    confidenceThreshold: 0.8,
    regions: ['br'], // Brasil
  },
  
  platRecognizerOffline: {
    enabled: import.meta.env.VITE_PLATERECOGNIZER_OFFLINE_ENABLED === 'true',
    endpoint: import.meta.env.VITE_PLATERECOGNIZER_OFFLINE_ENDPOINT || 'http://localhost:8081/v1/plate-reader/',
    licenseKey: import.meta.env.VITE_PLATERECOGNIZER_OFFLINE_LICENSE_KEY || 'TrHEk9pKez',
    apiToken: import.meta.env.VITE_PLATERECOGNIZER_OFFLINE_API_TOKEN || '3c545cd3eddd8323e580b39f8c0aaead7935f62c',
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
    theme: (import.meta.env.VITE_THEME as 'light' | 'dark') || 'light',
    refreshRate: 1000,
    showDebugInfo: false,
    language: (import.meta.env.VITE_LANGUAGE as 'pt-BR' | 'en-US') || 'pt-BR',
  },
};
