
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

class FileSystemLoggerService {
  private fileHandle: FileSystemFileHandle | null = null;
  private logBuffer: LogEntry[] = [];
  private flushInterval: number | null = null;

  async initialize(): Promise<void> {
    try {
      // Verificar se File System Access API está disponível
      if (!('showSaveFilePicker' in window)) {
        console.warn('File System Access API não disponível, usando fallback para localStorage');
        return;
      }

      this.fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: `access_log_${new Date().toISOString().split('T')[0]}.txt`,
        types: [{
          description: 'Text files',
          accept: { 'text/plain': ['.txt'] },
        }],
      });

      // Iniciar flush automático a cada 30 segundos
      this.flushInterval = window.setInterval(() => {
        this.flushLogs();
      }, 30000);

    } catch (error) {
      console.warn('Erro ao inicializar File System Logger:', error);
    }
  }

  async log(level: LogEntry['level'], message: string, data?: any): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    this.logBuffer.push(entry);

    // Fazer flush se buffer estiver cheio
    if (this.logBuffer.length >= 10) {
      await this.flushLogs();
    }

    // Fallback para localStorage se File System API não estiver disponível
    if (!this.fileHandle) {
      this.logToLocalStorage(entry);
    }
  }

  private logToLocalStorage(entry: LogEntry): void {
    const logs = JSON.parse(localStorage.getItem('access_logs') || '[]');
    logs.push(entry);
    
    // Manter apenas os últimos 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('access_logs', JSON.stringify(logs));
  }

  async flushLogs(): Promise<void> {
    if (!this.fileHandle || this.logBuffer.length === 0) return;

    try {
      const writable = await this.fileHandle.createWritable({ keepExistingData: true });
      
      for (const entry of this.logBuffer) {
        const logLine = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
        const dataLine = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : '';
        await writable.write(logLine + dataLine + '\n');
      }

      await writable.close();
      this.logBuffer = [];
    } catch (error) {
      console.error('Erro ao escrever logs:', error);
    }
  }

  async info(message: string, data?: any): Promise<void> {
    await this.log('info', message, data);
  }

  async warn(message: string, data?: any): Promise<void> {
    await this.log('warn', message, data);
  }

  async error(message: string, data?: any): Promise<void> {
    await this.log('error', message, data);
  }

  async close(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    await this.flushLogs();
    this.fileHandle = null;
  }

  getLocalStorageLogs(): LogEntry[] {
    return JSON.parse(localStorage.getItem('access_logs') || '[]');
  }
}

export const fileSystemLogger = new FileSystemLoggerService();
