import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, RefreshCw, AlertCircle, Settings, Terminal, ExternalLink, Info, Link } from 'lucide-react';
import { ESP32_CONFIG } from '@/config/esp32Config';

export const IpCameraFeed: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [attemptedUrls, setAttemptedUrls] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState('rtsp://admin:Leoze0607@192.168.0.10:554/Streaming/Channels/101');
  const [showQuickSetup, setShowQuickSetup] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const originalCameraUrl = customUrl || ESP32_CONFIG.camera.url;

  const generateAlternativeUrls = (rtspUrl: string): string[] => {
    try {
      const url = new URL(rtspUrl);
      const host = url.hostname;
      const port = url.port || '554';
      const username = url.username;
      const password = url.password;
      const auth = username && password ? `${username}:${password}@` : '';
      
      return [
        // 1. URL HTTP alternativa (porta 80)
        `http://${auth}${host}/Streaming/Channels/101`,
        `http://${auth}${host}:80/Streaming/Channels/101`,
        
        // 2. URLs MJPEG comuns
        `http://${auth}${host}/mjpeg/1`,
        `http://${auth}${host}/cgi-bin/mjpg/video.cgi`,
        `http://${auth}${host}/video.mjpg`,
        
        // 3. URLs snapshot que podemos refresh
        `http://${auth}${host}/Streaming/Channels/101/picture`,
        `http://${auth}${host}/cgi-bin/snapshot.cgi`,
        `http://${auth}${host}/snapshot.jpg`,
        `http://${auth}${host}/image/jpeg.cgi`,
        
        // 4. Portas alternativas
        `http://${auth}${host}:8080/Streaming/Channels/101`,
        `http://${auth}${host}:81/Streaming/Channels/101`,
        
        // 5. URL original como último recurso
        rtspUrl,
      ];
    } catch (error) {
      console.error('Erro ao gerar URLs alternativas:', error);
      return [rtspUrl];
    }
  };

  const alternativeUrls = generateAlternativeUrls(originalCameraUrl);

  const testUrl = async (url: string): Promise<boolean> => {
    try {
      console.log(`🔍 Testando URL: ${url}`);
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.log(`❌ Falha na URL: ${url}`, error);
      return false;
    }
  };

  const tryNextUrl = async () => {
    if (currentUrlIndex >= alternativeUrls.length) {
      setHasError(true);
      setErrorMessage('Nenhuma URL funcionou. Verifique se a câmera está acessível na rede.');
      setConnectionStatus('disconnected');
      setIsLoading(false);
      return;
    }

    const currentUrl = alternativeUrls[currentUrlIndex];
    setAttemptedUrls(prev => [...prev, currentUrl]);
    
    // Para URLs RTSP, mostra erro específico
    if (currentUrl.startsWith('rtsp://')) {
      console.log('📡 URL RTSP detectada, pulando para próxima...');
      setCurrentUrlIndex(prev => prev + 1);
      await tryNextUrl();
      return;
    }

    console.log(`🎥 Tentando carregar: ${currentUrl}`);
    
    if (imgRef.current) {
      imgRef.current.src = `${currentUrl}?t=${Date.now()}`;
    }
  };

  const initializeStream = async () => {
    console.log('🎥 Inicializando stream da câmera...');
    setIsLoading(true);
    setConnectionStatus('connecting');
    setHasError(false);
    setErrorMessage('');
    setCurrentUrlIndex(0);
    setAttemptedUrls([]);
    
    await tryNextUrl();
  };

  const handleQuickConnect = () => {
    if (!customUrl.trim()) {
      setErrorMessage('Por favor, insira uma URL válida');
      return;
    }
    console.log('🚀 Conectando rapidamente com:', customUrl);
    setShowQuickSetup(false);
    initializeStream();
  };

  useEffect(() => {
    if (!showQuickSetup) {
      initializeStream();
    }
  }, [showQuickSetup]);

  const handleImageLoad = () => {
    console.log('✅ Imagem da câmera carregada com sucesso');
    setIsLoading(false);
    setHasError(false);
    setConnectionStatus('connected');
  };

  const handleImageError = async () => {
    console.log(`❌ Erro ao carregar: ${alternativeUrls[currentUrlIndex]}`);
    setCurrentUrlIndex(prev => prev + 1);
    await tryNextUrl();
  };

  const refreshFeed = () => {
    console.log('🔄 Atualizando feed da câmera...');
    setLastRefresh(new Date());
    if (imgRef.current && connectionStatus === 'connected') {
      const currentSrc = imgRef.current.src.split('?')[0];
      imgRef.current.src = `${currentSrc}?t=${Date.now()}`;
    } else {
      initializeStream();
    }
  };

  useEffect(() => {
    if (connectionStatus === 'connected') {
      const interval = setInterval(() => {
        refreshFeed();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

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

  const currentUrl = alternativeUrls[currentUrlIndex] || 'N/A';

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
              AUTO
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickSetup(!showQuickSetup)}
              title="Configuração rápida"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              title="Mostrar informações de debug"
            >
              <Info className="h-4 w-4" />
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
        {showQuickSetup && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Link className="h-4 w-4" />
              Configuração Rápida da Câmera
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Cole a URL da sua câmera IP:
                </label>
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="rtsp://usuario:senha@ip:porta/caminho"
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleQuickConnect}
                  className="flex-1"
                  disabled={!customUrl.trim()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Conectar Câmera
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowQuickSetup(false)}
                >
                  Usar Padrão
                </Button>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <p><strong>Exemplo:</strong> rtsp://admin:senha123@192.168.1.100:554/stream</p>
              <p>O sistema testará automaticamente diferentes formatos de URL.</p>
            </div>
          </div>
        )}

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Procurando câmera...</p>
                <p className="text-xs text-gray-400">Tentativa {currentUrlIndex + 1} de {alternativeUrls.length}</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm text-gray-500 mb-2">Câmera não encontrada</p>
                <p className="text-xs text-gray-400 mb-2">IP: {new URL(originalCameraUrl).hostname}</p>
                {errorMessage && (
                  <p className="text-xs text-red-600 mb-3 px-4">{errorMessage}</p>
                )}
                <div className="bg-blue-50 p-3 rounded-lg mt-3 mb-3 text-left">
                  <p className="text-xs text-blue-700 mb-2">
                    <strong>Verificações automáticas:</strong>
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>✓ URLs HTTP alternativas</li>
                    <li>✓ Streams MJPEG</li>
                    <li>✓ Snapshots estáticos</li>
                    <li>✓ Portas alternativas</li>
                  </ul>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickSetup(true)}
                    className="mt-2"
                  >
                    Mudar URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={initializeStream}
                    className="mt-2"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <img
            ref={imgRef}
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
              Informações de Debug
            </h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-gray-700">URL Original:</p>
                <code className="bg-gray-200 px-2 py-1 rounded">{originalCameraUrl}</code>
              </div>
              
              {connectionStatus === 'connected' && (
                <div>
                  <p className="font-semibold text-gray-700">URL Ativa:</p>
                  <code className="bg-green-100 px-2 py-1 rounded text-green-800">{currentUrl}</code>
                </div>
              )}
              
              {attemptedUrls.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700">URLs Testadas:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {attemptedUrls.map((url, index) => (
                      <code key={index} className="block bg-gray-200 px-2 py-1 rounded text-xs">
                        {url}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="font-semibold text-gray-700">Dicas de Configuração:</p>
                <ul className="text-gray-600 space-y-1 mt-1">
                  <li>• Verifique se a câmera está na mesma rede</li>
                  <li>• Teste o IP no navegador: http://{new URL(originalCameraUrl).hostname}</li>
                  <li>• Verifique usuário/senha da câmera</li>
                  <li>• Algumas câmeras usam portas diferentes (80, 81, 8080)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <span>Câmera: {new URL(originalCameraUrl).hostname}</span>
          <span>Última atualização: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
