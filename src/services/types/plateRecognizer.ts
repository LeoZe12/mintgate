
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

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
