
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, AlertCircle } from 'lucide-react';
import { ESP32_CONFIG } from '@/config/esp32Config';

export const IpCameraFeed: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const imgRef = useRef<HTMLImageElement>(null);

  const cameraUrl = ESP32_CONFIG.camera.url;

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const refreshFeed = () => {
    setIsLoading(true);
    setHasError(false);
    setLastRefresh(new Date());
    
    if (imgRef.current) {
      // Força o reload da imagem adicionando timestamp
      const url = new URL(cameraUrl);
      url.searchParams.set('t', Date.now().toString());
      imgRef.current.src = url.toString();
    }
  };

  useEffect(() => {
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      refreshFeed();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Câmera IP - Feed ao Vivo
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={hasError ? "destructive" : "default"}>
              {hasError ? 'Desconectada' : 'Conectada'}
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
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Carregando feed...</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm text-gray-500 mb-2">Erro ao carregar câmera</p>
                <p className="text-xs text-gray-400">URL: {cameraUrl}</p>
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
            src={`${cameraUrl}?t=${lastRefresh.getTime()}`}
            alt="Feed da Câmera IP"
            className={`w-full max-h-96 object-contain rounded-lg ${
              isLoading || hasError ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <span>URL: {cameraUrl}</span>
          <span>Última atualização: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
