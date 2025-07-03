
export interface BackoffConfig {
  initialDelay: number;
  maxDelay: number;
  maxRetries: number;
  backoffFactor: number;
  jitter?: boolean;
}

export class ExponentialBackoffService {
  private defaultConfig: BackoffConfig = {
    initialDelay: 1000, // 1 segundo
    maxDelay: 30000,    // 30 segundos
    maxRetries: 5,
    backoffFactor: 2,
    jitter: true,
  };

  async executeWithBackoff<T>(
    operation: () => Promise<T>,
    config: Partial<BackoffConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let currentDelay = finalConfig.initialDelay;
    let attempt = 0;

    while (attempt < finalConfig.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        
        if (attempt >= finalConfig.maxRetries) {
          throw new Error(`Operação falhou após ${finalConfig.maxRetries} tentativas. Último erro: ${error}`);
        }

        // Calcular delay com backoff exponencial
        let delay = Math.min(currentDelay, finalConfig.maxDelay);
        
        // Adicionar jitter para evitar thundering herd
        if (finalConfig.jitter) {
          delay = delay * (0.5 + Math.random() * 0.5);
        }

        console.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay.toFixed(0)}ms:`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        currentDelay *= finalConfig.backoffFactor;
      }
    }

    throw new Error('Máximo de tentativas excedido');
  }

  async executeWithAbortSignal<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number,
    config: Partial<BackoffConfig> = {}
  ): Promise<T> {
    return this.executeWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const result = await operation(controller.signal);
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }, config);
  }
}

export const exponentialBackoffService = new ExponentialBackoffService();
