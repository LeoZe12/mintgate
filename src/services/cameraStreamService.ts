
export interface CameraStreamConfig {
  url: string;
  streamType: 'rtsp' | 'mjpeg' | 'http' | 'websocket';
  proxyEndpoint?: string;
}

export class CameraStreamService {
  private proxyUrl = 'http://localhost:3002'; // Servidor proxy para RTSP
  private isProxyAvailable = false;

  detectStreamType(url: string): 'rtsp' | 'mjpeg' | 'http' | 'websocket' {
    if (url.startsWith('rtsp://')) return 'rtsp';
    if (url.startsWith('ws://') || url.startsWith('wss://')) return 'websocket';
    if (url.includes('/mjpeg') || url.includes('mjpg')) return 'mjpeg';
    return 'http';
  }

  async checkProxyAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.proxyUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      this.isProxyAvailable = response.ok;
      console.log(`🔍 Proxy status check: ${this.isProxyAvailable ? 'Available' : 'Unavailable'}`);
      return this.isProxyAvailable;
    } catch (error) {
      console.error('❌ Erro ao verificar disponibilidade do proxy:', error);
      this.isProxyAvailable = false;
      return false;
    }
  }

  getStreamUrl(originalUrl: string): string {
    const streamType = this.detectStreamType(originalUrl);
    
    switch (streamType) {
      case 'rtsp':
        // Para RTSP, tentamos usar o proxy se disponível
        if (this.isProxyAvailable) {
          return `${this.proxyUrl}/stream/mjpeg?url=${encodeURIComponent(originalUrl)}`;
        } else {
          // Fallback: tenta converter para HTTP direto (algumas câmeras suportam)
          const httpUrl = originalUrl.replace('rtsp://', 'http://').replace(':554', ':80');
          console.warn('⚠️ Proxy não disponível, tentando URL HTTP:', httpUrl);
          return httpUrl;
        }
      
      case 'mjpeg':
        return originalUrl;
      
      case 'http':
        // Para HTTP simples, assumimos que é uma imagem estática que pode ser refreshed
        return `${originalUrl}?t=${Date.now()}`;
      
      default:
        return originalUrl;
    }
  }

  async testConnection(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      const streamType = this.detectStreamType(url);
      
      // Para RTSP, primeiro verifica se o proxy está disponível
      if (streamType === 'rtsp') {
        const proxyAvailable = await this.checkProxyAvailability();
        if (!proxyAvailable) {
          return {
            success: false,
            error: 'Servidor proxy RTSP não está disponível na porta 3002. Execute: npm run rtsp-proxy'
          };
        }
      }
      
      const streamUrl = this.getStreamUrl(url);
      console.log(`🎥 Testando conexão: ${streamUrl}`);
      
      const response = await fetch(streamUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(8000)
      });
      
      if (response.ok) {
        console.log('✅ Conexão da câmera bem-sucedida');
        return { success: true };
      } else {
        return {
          success: false,
          error: `Erro HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      console.error('❌ Erro ao testar conexão da câmera:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Timeout: Conexão muito lenta ou câmera não responde' };
        }
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Erro desconhecido na conexão' };
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

  // Método para obter instruções de troubleshooting
  getTroubleshootingInstructions(streamType: string): string[] {
    const instructions: string[] = [];
    
    switch (streamType) {
      case 'rtsp':
        instructions.push('1. Certifique-se de que o FFmpeg está instalado no sistema');
        instructions.push('2. Execute: npm run install-rtsp para instalar dependências');
        instructions.push('3. Execute: npm run rtsp-proxy para iniciar o servidor proxy');
        instructions.push('4. Verifique se a porta 3002 não está sendo usada por outro serviço');
        instructions.push('5. Teste a URL RTSP em um player como VLC primeiro');
        break;
      case 'http':
        instructions.push('1. Verifique se a URL da câmera está acessível na rede');
        instructions.push('2. Teste a URL diretamente no navegador');
        instructions.push('3. Verifique credenciais de autenticação se necessário');
        break;
      case 'mjpeg':
        instructions.push('1. Verifique se o stream MJPEG está ativo na câmera');
        instructions.push('2. Teste a URL em um navegador ou player de mídia');
        break;
    }
    
    return instructions;
  }
}

export const cameraStreamService = new CameraStreamService();
