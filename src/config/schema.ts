
import { z } from 'zod';

// Schema de validação para configurações do ESP32
export const Esp32ConfigSchema = z.object({
  esp32: z.object({
    ipAddress: z.string().ip('Endereço IP inválido'),
    port: z.number().min(1).max(65535, 'Porta deve estar entre 1 e 65535'),
    maxRetries: z.number().min(1).max(10, 'Máximo de 10 tentativas'),
    timeout: z.number().min(1000, 'Timeout mínimo de 1000ms'),
    pollingInterval: z.number().min(1000, 'Intervalo mínimo de 1000ms'),
    autoReconnect: z.boolean(),
    debugMode: z.boolean(),
  }),
  
  gpio: z.object({
    externalLoopPort: z.number().min(0).max(39, 'Porta GPIO deve estar entre 0 e 39'),
    internalLoopPort: z.number().min(0).max(39, 'Porta GPIO deve estar entre 0 e 39'),
    gateControlPort: z.number().min(0).max(39, 'Porta GPIO deve estar entre 0 e 39'),
  }),
  
  camera: z.object({
    url: z.string().url('URL da câmera inválida'),
    streamFormat: z.enum(['mjpeg', 'rtsp', 'http']),
    quality: z.enum(['low', 'medium', 'high']),
    fps: z.number().min(1).max(60, 'FPS deve estar entre 1 e 60'),
  }),
  
  platRecognizer: z.object({
    apiKey: z.string().min(1, 'API Key é obrigatória'),
    licenseKey: z.string().min(1, 'License Key é obrigatória'),
    apiUrl: z.string().url('URL da API inválida'),
    confidenceThreshold: z.number().min(0).max(1, 'Threshold deve estar entre 0 e 1'),
    regions: z.array(z.string()),
  }),
  
  api: z.object({
    baseUrl: z.string(),
    endpoints: z.object({
      status: z.string(),
      open: z.string(),
      close: z.string(),
      config: z.string(),
    }),
  }),
  
  ui: z.object({
    theme: z.enum(['light', 'dark']),
    refreshRate: z.number().min(100, 'Taxa de atualização mínima de 100ms'),
    showDebugInfo: z.boolean(),
    language: z.enum(['pt-BR', 'en-US']),
  }),
});

export type Esp32ConfigType = z.infer<typeof Esp32ConfigSchema>;

// Função para validar configuração
export const validateConfig = (config: unknown): Esp32ConfigType => {
  try {
    return Esp32ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(`Erro de validação da configuração:\n${errorMessages}`);
    }
    throw error;
  }
};
