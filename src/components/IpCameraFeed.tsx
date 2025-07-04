
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, AlertCircle, Settings, Terminal, ExternalLink } from 'lucide-react';
import { ESP32_CONFIG } from '@/config/esp32Config';
import { cameraStreamService } from '@/services/cameraStreamService';

export const IpCameraFeed: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [streamType, setStreamType] = useState<string>('');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const originalCameraUrl = ESP32_CONFIG.camera.url;
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');

  useEffect(() => {
    initializeStream();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const initializeStream = async () => {
    console.log('🎥 Inicializando stream da câmera...');
    setIsLoading(true);
    setConnectionStatus('connecting');
    setHasError(false);
    setErrorMessage('');
    
    const detectedType = cameraStreamService.detectStreamType(originalCameraUrl);
    setStreamType(detectedType);
    console.log(`📡 Tipo de stream detectado: ${detectedType}`);
    
    if (detectedType === 'websocket') {
      setupWebSocketStream();
    } else {
      // Testa a conexão antes de tentar carregar
      const connectionTest = await cameraStreamService.testConnection(originalCameraUrl);
      
      if (!connectionTest.success) {
        console.error('❌ Falha no teste de conexão:', connectionTest.error);
        setHasError(true);
        setErrorMessage(connectionTest.error || 'Erro desconhecido');
        setConnectionStatus('disconnected');
        setIsLoading(false);
        return;
      }
      
      const streamUrl = cameraStreamService.getStreamUrl(originalCameraUrl);
      console.log('🔗 URL do stream:', streamUrl);
      setCurrentStreamUrl(streamUrl);
    }
  };

  const setupWebSocketStream = () => {
    const ws = cameraStreamService.createWebSocketStream(originalCameraUrl);
    if (!ws) {
      setHasError(true);
      setErrorMessage('Falha ao criar conexão WebSocket');
      setConnectionStatus('disconnected');
      setIsLoading(false);
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket conectado');
      setConnectionStatus('connected');
      setHasError(false);
      setIsLoading(false);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const url = URL.createObjectURL(event.data);
        if (imgRef.current) {
          imgRef.current.src = url;
        }
      }
    };

    ws.onerror = (error) => {
      console.error('❌ Erro no WebSocket:', error);
      setHasError(true);
      setErrorMessage('Erro na conexão WebSocket');
      setConnectionStatus('disconnected');
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket desconectado');
      setConnectionStatus('disconnected');
    };
  };

  const handleImageLoad = () => {
    console.log('✅ Imagem da câmera carregada com sucesso');
    setIsLoading(false);
    setHasError(false);
    setConnectionStatus('connected');
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('❌ Erro ao carregar imagem da câmera:', event);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Falha ao carregar o feed da câmera');
    setConnectionStatus('disconnected');
  };

  const refreshFeed = () => {
    console.log('🔄 Atualizando feed da câmera...');
    setLastRefresh(new Date());
    initializeStream();
  };

  // Auto-refresh para streams não-websocket
  useEffect(() => {
    if (streamType !== 'websocket' && connectionStatus === 'connected') {
      const interval = setInterval(() => {
        refreshFeed();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [streamType, connectionStatus]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'default';
      case 'connecting': return 'secondary';
      case 'disconnected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectada';
      case 'connecting': return 'Conectando...';
      case 'disconnected': return 'Desconectada';
      default: return 'Desconhecido';
    }
  };

  const troubleshootingInstructions = cameraStreamService.getTroubleshootingInstructions(streamType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Câmera IP - Feed ao Vivo
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {streamType.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              title="Mostrar ajuda de troubleshooting"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFeed}
              disabled={isLoading}
              title="Atualizar feed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Carregando feed...</p>
                <p className="text-xs text-gray-400">Tipo: {streamType}</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm text-gray-500 mb-2">Erro ao carregar câmera</p>
                <p className="text-xs text-gray-400 mb-2">URL: {originalCameraUrl}</p>
                <p className="text-xs text-gray-400 mb-2">Tipo: {streamType}</p>
                {errorMessage && (
                  <p className="text-xs text-red-600 mb-3 px-4">{errorMessage}</p>
                )}
                {streamType === 'rtsp' && (
                  <div className="bg-yellow-50 p-3 rounded-lg mt-3 mb-3">
                    <Terminal className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                    <p className="text-xs text-yellow-700 mb-2">
                      Para streams RTSP, execute os comandos:
                    </p>
                    <code className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded block mb-1">
                      npm run install-rtsp
                    </code>
                    <code className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded block">
                      npm run rtsp-proxy
                    </code>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshFeed}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}
          
          <img
            ref={imgRef}
            src={currentStreamUrl}
            alt="Feed da Câmera IP"
            className={`w-full max-h-96 object-contain rounded-lg ${
              isLoading || hasError ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        
        {showTroubleshooting && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Guia de Solução de Problemas
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {troubleshootingInstructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
            <div className="mt-3 pt-2 border-t border-blue-200">
              <p className="text-xs text-gray-500 mb-2">Links úteis:</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <a href="https://ffmpeg.org/download.html" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Download FFmpeg
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <a href="https://www.videolan.org/vlc/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    VLC Player
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <div className="flex flex-col gap-1">
            <span>URL Original: {originalCameraUrl}</span>
            {currentStreamUrl && streamType !== 'websocket' && (
              <span>URL Stream: {currentStreamUrl}</span>
            )}
          </div>
          <span>Última atualização: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
