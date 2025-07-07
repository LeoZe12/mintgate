export interface CameraConnection {
  url: string;
  isConnected: boolean;
  lastTest?: Date;
  workingUrl?: string;
}

export class CameraService {
  private connection: CameraConnection = {
    url: '',
    isConnected: false,
  };

  // Gerar URLs alternativas baseadas na URL principal
  generateAlternativeUrls(originalUrl: string): string[] {
    try {
      const url = new URL(originalUrl);
      const host = url.hostname;
      const username = url.username;
      const password = url.password;
      const auth = username && password ? `${username}:${password}@` : '';
      
      return [
        // URLs HTTP diretas para snapshot
        `http://${auth}${host}/Streaming/Channels/101/picture`,
        `http://${auth}${host}/snapshot.jpg`,
        `http://${auth}${host}/cgi-bin/snapshot.cgi`,
        `http://${auth}${host}/image/jpeg.cgi`,
        
        // URLs MJPEG para stream
        `http://${auth}${host}/mjpeg/1`,
        `http://${auth}${host}/video.mjpg`,
        `http://${auth}${host}/cgi-bin/mjpg/video.cgi`,
        
        // Portas alternativas
        `http://${auth}${host}:80/Streaming/Channels/101/picture`,
        `http://${auth}${host}:8080/snapshot.jpg`,
        `http://${auth}${host}:81/image.jpg`,
        
        // URLs com refresh para evitar cache
        `http://${auth}${host}/Streaming/Channels/101/picture?t=${Date.now()}`,
        `http://${auth}${host}/snapshot.jpg?t=${Date.now()}`,
      ];
    } catch (error) {
      console.error('Erro ao gerar URLs alternativas:', error);
      return [originalUrl];
    }
  }

  async testCameraUrl(url: string): Promise<boolean> {
    try {
      console.log(`🔍 Testando URL da câmera: ${url}`);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      
      const isValid = response.ok && response.headers.get('content-type')?.includes('image');
      
      if (isValid) {
        console.log(`✅ URL válida encontrada: ${url}`);
      }
      
      return isValid;
    } catch (error) {
      console.log(`❌ URL falhou: ${url}`);
      return false;
    }
  }

  async testCameraViaProxy(originalUrl: string): Promise<{ success: boolean; workingUrl?: string; error?: string }> {
    try {
      console.log('🌐 Testando câmera via proxy backend...');
      
      const response = await fetch('https://pijywwisqjcwrkehjelks.supabase.co/functions/v1/camera-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpanl3d2lzcWpjd3JrZWhlbGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MzY0MjMsImV4cCI6MjA2NjMxMjQyM30.usfgcSJkWJ-rGgjQ6GlC6F2DQ0FlvClM94zHpLzsI3g',
        },
        body: JSON.stringify({
          cameraUrl: originalUrl,
          action: 'test'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.connection = {
          url: originalUrl,
          isConnected: true,
          lastTest: new Date(),
          workingUrl: result.workingUrl,
        };
        return { success: true, workingUrl: result.workingUrl };
      } else {
        this.connection = {
          url: originalUrl,
          isConnected: false,
          lastTest: new Date(),
        };
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro no proxy da câmera:', error);
      return { success: false, error: `Erro no proxy: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
    }
  }

  async findWorkingCameraUrl(originalUrl: string): Promise<string | null> {
    console.log('🎥 Procurando URL funcional da câmera...');
    
    // Primeiro tenta via proxy (evita problemas de CORS)
    const proxyResult = await this.testCameraViaProxy(originalUrl);
    if (proxyResult.success && proxyResult.workingUrl) {
      return proxyResult.workingUrl;
    }
    
    // Se o proxy não funcionar, tenta o método direto
    const alternativeUrls = this.generateAlternativeUrls(originalUrl);
    
    for (const url of alternativeUrls) {
      const isWorking = await this.testCameraUrl(url);
      if (isWorking) {
        this.connection = {
          url: originalUrl,
          isConnected: true,
          lastTest: new Date(),
          workingUrl: url,
        };
        return url;
      }
    }
    
    this.connection = {
      url: originalUrl,
      isConnected: false,
      lastTest: new Date(),
    };
    
    return null;
  }

  async connectCamera(url: string): Promise<{ success: boolean; workingUrl?: string; error?: string }> {
    try {
      const workingUrl = await this.findWorkingCameraUrl(url);
      
      if (workingUrl) {
        return {
          success: true,
          workingUrl,
        };
      } else {
        return {
          success: false,
          error: 'Nenhuma URL da câmera funcionou. Verifique se a câmera está acessível na rede.',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Erro ao conectar câmera: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  getConnectionStatus(): CameraConnection {
    return { ...this.connection };
  }

  generateRefreshedUrl(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }

  async captureImage(url?: string): Promise<Blob | null> {
    const targetUrl = url || this.connection.workingUrl;
    if (!targetUrl) return null;

    try {
      // Primeiro tenta via proxy para evitar CORS
      const proxyResponse = await fetch('https://pijywwisqjcwrkehjelks.supabase.co/functions/v1/camera-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpanl3d2lzcWpjd3JrZWhlbGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MzY0MjMsImV4cCI6MjA2NjMxMjQyM30.usfgcSJkWJ-rGgjQ6GlC6F2DQ0FlvClM94zHpLzsI3g',
        },
        body: JSON.stringify({
          cameraUrl: targetUrl,
          action: 'capture'
        })
      });

      if (proxyResponse.ok) {
        return await proxyResponse.blob();
      }

      // Fallback para método direto
      const refreshedUrl = this.generateRefreshedUrl(targetUrl);
      const response = await fetch(refreshedUrl, {
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      return null;
    }
  }

  getTroubleshootingTips(): string[] {
    return [
      '1. Verifique se a câmera está na mesma rede que o computador',
      '2. Teste o IP da câmera no navegador: http://IP_DA_CAMERA',
      '3. Confirme usuário e senha da câmera',
      '4. Verifique se a câmera suporta HTTP/MJPEG',
      '5. Algumas câmeras usam portas diferentes (80, 81, 8080)',
      '6. Tente acessar a interface web da câmera primeiro',
    ];
  }
}

export const cameraService = new CameraService();