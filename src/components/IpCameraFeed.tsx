
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, AlertCircle, Settings } from 'lucide-react';
import { ESP32_CONFIG } from '@/config/esp32Config';
import { cameraStreamService } from '@/services/cameraStreamService';

export const IpCameraFeed: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [streamType, setStreamType] = useState<string>('');
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
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    const detectedType = cameraStreamService.detectStreamType(originalCameraUrl);
    setStreamType(detectedType);
    
    if (detectedType === 'websocket') {
      setupWebSocketStream();
    } else {
      const streamUrl = cameraStreamService.getStreamUrl(originalCameraUrl);
      setCurrentStreamUrl(streamUrl);
      
      // Teste de conexão
      const isConnected = await cameraStreamService.testConnection(originalCameraUrl);
      if (!isConnected) {
        setHasError(true);
        setConnectionStatus('disconnected');
        setIsLoading(false);
      }
    }
  };

  const setupWebSocketStream = () => {
    const ws = cameraStreamService.createWebSocketStream(originalCameraUrl);
    if (!ws) {
      setHasError(true);
      setConnectionStatus('disconnected');
      setIsLoading(false);
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
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

    ws.onerror = () => {
      setHasError(true);
      setConnectionStatus('disconnected');
      setIsLoading(false);
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setConnectionStatus('connected');
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    setConnectionStatus('disconnected');
  };

  const refreshFeed = () => {
    setIsLoading(true);
    setHasError(false);
    setLastRefresh(new Date());
    
    if (streamType === 'websocket') {
      if (wsRef.current) {
        wsRef.current.close();
      }
      setupWebSocketStream();
    } else {
      const newStreamUrl = cameraStreamService.getStreamUrl(originalCameraUrl);
      setCurrentStreamUrl(newStreamUrl);
      
      if (imgRef.current) {
        imgRef.current.src = newStreamUrl;
      }
    }
  };

  useEffect(() => {
    // Auto-refresh para streams não-websocket
    if (streamType !== 'websocket') {
      const interval = setInterval(() => {
        refreshFeed();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [streamType]);

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
              onClick={refreshFeed}
              disabled={isLoading}
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
                {streamType === 'rtsp' && (
                  <div className="bg-yellow-50 p-3 rounded-lg mt-3">
                    <Settings className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                    <p className="text-xs text-yellow-700">
                      Para streams RTSP, certifique-se de que o servidor proxy está rodando na porta 3002
                    </p>
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
