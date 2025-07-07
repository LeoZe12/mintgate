
import { plateRecognizerOfflineService } from './plateRecognizerOfflineService';
import { plateCacheService } from './plateCache';
import { performanceMetricsService } from './performanceMetrics';
import { fileSystemLogger } from './fileSystemLogger';
import { exponentialBackoffService } from './exponentialBackoff';
import { imageValidatorService } from './validation/imageValidator';
import { BulkProcessorService } from './processing/bulkProcessor';
import type { 
  EnhancedPlateRecognitionConfig, 
  BulkProcessingResult 
} from './types/plateRecognizer';

class EnhancedPlateRecognizerService {
  private config: EnhancedPlateRecognitionConfig = {
    confidenceThreshold: 0.7,
    regions: ['br'],
    useCache: true,
    enableMetrics: true,
    enableFileLogging: true,
    timeoutMs: 30000,
    retryConfig: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
    },
  };

  private bulkProcessor: BulkProcessorService;

  constructor() {
    this.bulkProcessor = new BulkProcessorService(
      this.config,
      this.recognizePlateEnhanced.bind(this)
    );
  }

  updateConfig(newConfig: Partial<EnhancedPlateRecognitionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.bulkProcessor = new BulkProcessorService(
      this.config,
      this.recognizePlateEnhanced.bind(this)
    );
  }

  validateImageFile(file: File) {
    return imageValidatorService.validateImageFile(file);
  }

  async recognizePlateEnhanced(file: File): Promise<any> {
    const operationId = `plate_recognition_${Date.now()}`;
    
    // Validar arquivo
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Iniciar métricas
    if (this.config.enableMetrics) {
      performanceMetricsService.startOperation(operationId, 'Plate Recognition', {
        filename: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    }

    try {
      // Verificar cache primeiro
      if (this.config.useCache) {
        const cachedResult = await plateCacheService.getCachedResult(file);
        if (cachedResult) {
          if (this.config.enableFileLogging) {
            await fileSystemLogger.info('Resultado encontrado no cache', {
              filename: file.name,
              plate: cachedResult.plate,
            });
          }

          if (this.config.enableMetrics) {
            performanceMetricsService.endOperation(operationId, 'Plate Recognition (Cached)', true, undefined, {
              cached: true,
            });
          }

          return cachedResult;
        }
      }

      // Processar com SDK offline apenas
      const result = await exponentialBackoffService.executeWithAbortSignal(
        async (signal) => {
          return await plateRecognizerOfflineService.recognizePlate(file);
        },
        this.config.timeoutMs,
        this.config.retryConfig
      );

      // Verificar threshold de confiança
      if (result.confidence < this.config.confidenceThreshold) {
        throw new Error(`Confiança muito baixa: ${result.confidence}`);
      }

      // Salvar no cache
      if (this.config.useCache && result.plate) {
        await plateCacheService.cacheResult(file, result);
      }

      // Log do resultado
      if (this.config.enableFileLogging) {
        await fileSystemLogger.info('Placa reconhecida com sucesso', {
          filename: file.name,
          plate: result.plate,
          confidence: result.confidence,
        });
      }

      // Finalizar métricas
      if (this.config.enableMetrics) {
        performanceMetricsService.endOperation(operationId, 'Plate Recognition', true, undefined, {
          plateFound: result.plate,
          confidence: result.confidence,
        });
      }

      return result;

    } catch (error) {
      // Log do erro
      if (this.config.enableFileLogging) {
        await fileSystemLogger.error('Erro no reconhecimento de placa', {
          filename: file.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Finalizar métricas com erro
      if (this.config.enableMetrics) {
        performanceMetricsService.endOperation(
          operationId, 
          'Plate Recognition', 
          false, 
          error instanceof Error ? error.message : String(error)
        );
      }

      throw error;
    }
  }

  async processBulk(files: File[]): Promise<BulkProcessingResult> {
    return this.bulkProcessor.processBulk(files);
  }

  getPerformanceStats(): any {
    if (!this.config.enableMetrics) {
      return null;
    }

    return {
      averageLatency: performanceMetricsService.getAverageLatency('Plate Recognition'),
      successRate: performanceMetricsService.getSuccessRate('Plate Recognition'),
      totalOperations: performanceMetricsService.getMetrics('Plate Recognition').length,
      cachedOperations: performanceMetricsService.getMetrics('Plate Recognition (Cached)').length,
    };
  }

  async clearCache(): Promise<void> {
    await plateCacheService.clearExpiredCache();
  }

  exportMetrics(): string {
    return performanceMetricsService.exportMetrics();
  }

  async initializeFileLogging(): Promise<void> {
    if (this.config.enableFileLogging) {
      await fileSystemLogger.initialize();
    }
  }

  async closeFileLogging(): Promise<void> {
    if (this.config.enableFileLogging) {
      await fileSystemLogger.close();
    }
  }
}

export const enhancedPlateRecognizerService = new EnhancedPlateRecognizerService();
