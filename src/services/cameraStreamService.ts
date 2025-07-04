
export interface CameraStreamConfig {
  url: string;
  streamType: 'rtsp' | 'mjpeg' | 'http' | 'websocket';
  proxyEndpoint?: string;
}

export class CameraStreamService {
  private proxyUrl = 'http://localhost:3002'; // Servidor proxy para RTSP

  detectStreamType(url: string): 'rtsp' | 'mjpeg' | 'http' | 'websocket' {
    if (url.startsWith('rtsp://')) return 'rtsp';
    if (url.startsWith('ws://') || url.startsWith('wss://')) return 'websocket';
    if (url.includes('/mjpeg') || url.includes('mjpg')) return 'mjpeg';
    return 'http';
  }

  getStreamUrl(originalUrl: string): string {
    const streamType = this.detectStreamType(originalUrl);
    
    switch (streamType) {
      case 'rtsp':
        // Para RTSP, usamos um proxy que converte para MJPEG
        return `${this.proxyUrl}/stream/mjpeg?url=${encodeURIComponent(originalUrl)}`;
      
      case 'mjpeg':
        return originalUrl;
      
      case 'http':
        // Para HTTP simples, assumimos que é uma imagem estática que pode ser refreshed
        return `${originalUrl}?t=${Date.now()}`;
      
      default:
        return originalUrl;
    }
  }

  async testConnection(url: string): Promise<boolean> {
    try {
      const streamUrl = this.getStreamUrl(url);
      const response = await fetch(streamUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão da câmera:', error);
      return false;
    }
  }

  createWebSocketStream(url: string): WebSocket | null {
    try {
      return new WebSocket(url);
    } catch (error) {
      console.error('Erro ao criar WebSocket stream:', error);
      return null;
    }
  }
}

export const cameraStreamService = new CameraStreamService();
