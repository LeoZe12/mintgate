
export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

class PerformanceMetricsService {
  private metrics: PerformanceMetric[] = [];
  private activeOperations = new Map<string, number>();

  startOperation(operationId: string, operationName: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.activeOperations.set(operationId, startTime);
    
    console.log(`🚀 Iniciando operação: ${operationName}`, metadata);
  }

  endOperation(operationId: string, operationName: string, success: boolean = true, error?: string, metadata?: Record<string, any>): PerformanceMetric {
    const endTime = performance.now();
    const startTime = this.activeOperations.get(operationId);
    
    if (!startTime) {
      throw new Error(`Operação ${operationId} não foi iniciada`);
    }

    const metric: PerformanceMetric = {
      operation: operationName,
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      error,
      metadata,
    };

    this.metrics.push(metric);
    this.activeOperations.delete(operationId);

    console.log(`⏱️ Operação finalizada: ${operationName} - ${metric.duration.toFixed(2)}ms`, {
      success,
      error,
      metadata,
    });

    return metric;
  }

  getMetrics(operationName?: string): PerformanceMetric[] {
    if (operationName) {
      return this.metrics.filter(m => m.operation === operationName);
    }
    return [...this.metrics];
  }

  getAverageLatency(operationName: string): number {
    const operationMetrics = this.getMetrics(operationName);
    if (operationMetrics.length === 0) return 0;

    const totalDuration = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalDuration / operationMetrics.length;
  }

  getSuccessRate(operationName: string): number {
    const operationMetrics = this.getMetrics(operationName);
    if (operationMetrics.length === 0) return 0;

    const successCount = operationMetrics.filter(m => m.success).length;
    return (successCount / operationMetrics.length) * 100;
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  exportMetrics(): string {
    const csvHeaders = 'Operation,Start Time,End Time,Duration (ms),Success,Error,Metadata\n';
    const csvRows = this.metrics.map(metric => 
      `"${metric.operation}",${metric.startTime},${metric.endTime},${metric.duration.toFixed(2)},${metric.success},"${metric.error || ''}","${JSON.stringify(metric.metadata || {})}"`
    ).join('\n');

    return csvHeaders + csvRows;
  }
}

export const performanceMetricsService = new PerformanceMetricsService();
