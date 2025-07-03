
import { plateRecognizerOfflineService } from './plateRecognizerOfflineService';
import { plateCacheService } from './plateCache';
import { performanceMetricsService } from './performanceMetrics';
import { fileSystemLogger } from './fileSystemLogger';
import { exponentialBackoffService } from './exponentialBackoff';
import { ESP32_CONFIG } from '@/config/esp32Config';

export interface EnhancedPlateRecognitionConfig {
  confidenceThreshold: number;
  regions: string[];
  useCache: boolean;
  enableMetrics: boolean;
  enableFileLogging: boolean;
  timeoutMs: number;
  retryConfig?: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
  };
}

export interface BulkProcessingResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    filename: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  totalTime: number;
  averageTime: number;
}

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

  updateConfig(newConfig: Partial<EnhancedPlateRecognitionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const minSize = 1024; // 1KB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo inválido. Tipos aceitos: ${validTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`
      };
    }

    if (file.size < minSize) {
      return {
        valid: false,
        error: `Arquivo muito pequeno. Tamanho mínimo: ${(minSize / 1024).toFixed(1)}KB`
      };
    }

    return { valid: true };
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
              plate: cachedResult.results[0]?.plate,
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

      // Processar com retry e backoff
      const result = await exponentialBackoffService.executeWithAbortSignal(
        async (signal) => {
          return await plateRecognizerOfflineService.recognizePlate(file, {
            regions: this.config.regions,
          });
        },
        this.config.timeoutMs,
        this.config.retryConfig
      );

      // Filtrar por threshold de confiança
      const filteredResult = {
        ...result,
        results: result.results.filter(r => r.confidence >= this.config.confidenceThreshold)
      };

      // Salvar no cache
      if (this.config.useCache && filteredResult.results.length > 0) {
        await plateCacheService.cacheResult(file, filteredResult);
      }

      // Log do resultado
      if (this.config.enableFileLogging) {
        await fileSystemLogger.info('Placa reconhecida com sucesso', {
          filename: file.name,
          plates: filteredResult.results.map(r => r.plate),
          processingTime: result.processing_time,
        });
      }

      // Finalizar métricas
      if (this.config.enableMetrics) {
        performanceMetricsService.endOperation(operationId, 'Plate Recognition', true, undefined, {
          platesFound: filteredResult.results.length,
          processingTime: result.processing_time,
        });
      }

      return filteredResult;

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
    const startTime = performance.now();
    const results: BulkProcessingResult['results'] = [];
    let successful = 0;
    let failed = 0;

    if (this.config.enableFileLogging) {
      await fileSystemLogger.info(`Iniciando processamento em lote`, {
        totalFiles: files.length,
      });
    }

    for (const [index, file] of files.entries()) {
      try {
        console.log(`Processando arquivo ${index + 1}/${files.length}: ${file.name}`);
        
        const result = await this.recognizePlateEnhanced(file);
        results.push({
          filename: file.name,
          success: true,
          result,
        });
        successful++;

      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        results.push({
          filename: file.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        failed++;
      }
    }

    const totalTime = performance.now() - startTime;
    const averageTime = totalTime / files.length;

    const bulkResult: BulkProcessingResult = {
      totalProcessed: files.length,
      successful,
      failed,
      results,
      totalTime,
      averageTime,
    };

    if (this.config.enableFileLogging) {
      await fileSystemLogger.info('Processamento em lote finalizado', bulkResult);
    }

    return bulkResult;
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
