
import type { BulkProcessingResult, EnhancedPlateRecognitionConfig } from '../types/plateRecognizer';
import { fileSystemLogger } from '../fileSystemLogger';

export class BulkProcessorService {
  constructor(
    private config: EnhancedPlateRecognitionConfig,
    private recognizePlateEnhanced: (file: File) => Promise<any>
  ) {}

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
}
