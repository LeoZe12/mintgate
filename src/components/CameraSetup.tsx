
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraSetupProps {
  onCameraConfigured: (url: string) => void;
  currentUrl?: string;
}

export const CameraSetup: React.FC<CameraSetupProps> = ({ onCameraConfigured, currentUrl }) => {
  const [url, setUrl] = useState(currentUrl || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const testConnection = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Necessária",
        description: "Por favor, insira a URL da câmera",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('testing');

    try {
      // Testar diferentes formatos de URL
      const testUrls = generateTestUrls(url);
      
      for (const testUrl of testUrls) {
        try {
          console.log(`🔍 Testando: ${testUrl}`);
          const response = await fetch(testUrl, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            setConnectionStatus('success');
            onCameraConfigured(testUrl);
            
            toast({
              title: "Câmera Conectada!",
              description: `Câmera configurada com sucesso em ${new URL(testUrl).hostname}`,
            });
            
            return;
          }
        } catch (error) {
          console.log(`❌ Falhou: ${testUrl}`);
        }
      }
      
      // Se chegou aqui, nenhuma URL funcionou
      throw new Error('Nenhuma configuração de câmera funcionou');
      
    } catch (error) {
      console.error('Erro ao conectar câmera:', error);
      setConnectionStatus('error');
      
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar à câmera. Verifique a URL e se a câmera está acessível na rede.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const generateTestUrls = (originalUrl: string): string[] => {
    try {
      const url = new URL(originalUrl);
      const host = url.hostname;
      const username = url.username;
      const password = url.password;
      const auth = username && password ? `${username}:${password}@` : '';
      
      return [
        // URLs HTTP diretas
        `http://${auth}${host}/Streaming/Channels/101/picture`,
        `http://${auth}${host}/snapshot.jpg`,
        `http://${auth}${host}/cgi-bin/snapshot.cgi`,
        `http://${auth}${host}/image/jpeg.cgi`,
        `http://${auth}${host}/video.mjpg`,
        
        // URLs com portas alternativas
        `http://${auth}${host}:80/snapshot.jpg`,
        `http://${auth}${host}:8080/snapshot.jpg`,
        `http://${auth}${host}:81/snapshot.jpg`,
      ];
    } catch (error) {
      return [originalUrl];
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Camera className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return 'Testando...';
      case 'success': return 'Conectada';
      case 'error': return 'Erro';
      default: return 'Não testada';
    }
  };

  const getStatusVariant = () => {
    switch (connectionStatus) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'testing': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Configuração da Câmera IP
          <Badge variant={getStatusVariant()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            URL da Câmera IP:
          </label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="rtsp://usuario:senha@192.168.1.100:554/stream"
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">
            Exemplo: rtsp://admin:senha123@192.168.1.100:554/Streaming/Channels/101
          </p>
        </div>

        <Button 
          onClick={testConnection}
          disabled={isConnecting || !url.trim()}
          className="w-full"
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          {isConnecting ? 'Conectando...' : 'Conectar Câmera'}
        </Button>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Como usar:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>1. Cole a URL RTSP da sua câmera IP</li>
            <li>2. Clique em "Conectar Câmera"</li>
            <li>3. O sistema testará automaticamente diferentes formatos</li>
            <li>4. Quando conectar, o reconhecimento de placas será ativado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
