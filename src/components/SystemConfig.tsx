
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Camera, Cpu, Network, Key } from 'lucide-react';

interface SystemConfigType {
  // Configurações do ESP32
  esp32Port: string;
  esp32IpAddress: string;
  
  // Configurações das Portas do ESP32
  externalLoopPort: string;
  internalLoopPort: string;
  gateControlPort: string;
  
  // Configurações da Câmera
  cameraUrl: string;
  
  // Configurações do PlatRecognizer
  platRecognizerApiKey: string;
  platRecognizerLicenseKey: string;
  
  // Configurações Gerais
  pollingInterval: number;
  autoReconnect: boolean;
  debugMode: boolean;
  maxRetries: number;
}

export const SystemConfig: React.FC = () => {
  const [config, setConfig] = useState<SystemConfigType>({
    esp32Port: '80',
    esp32IpAddress: '192.168.1.100',
    externalLoopPort: '2',
    internalLoopPort: '3',
    gateControlPort: '4',
    cameraUrl: 'http://192.168.1.101:8080/video',
    platRecognizerApiKey: '',
    platRecognizerLicenseKey: '',
    pollingInterval: 5000,
    autoReconnect: true,
    debugMode: false,
    maxRetries: 3,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar configurações salvas
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/esp32/config');
      if (response.ok) {
        const savedConfig = await response.json();
        setConfig(prev => ({ ...prev, ...savedConfig }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/esp32/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast({
          title: "Configurações salvas",
          description: "As configurações foram atualizadas com sucesso.",
        });
      } else {
        throw new Error('Falha ao salvar configurações');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (key: keyof SystemConfigType, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Configurações do ESP32 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Configurações do ESP32
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="esp32-ip">Endereço IP do ESP32</Label>
              <Input
                id="esp32-ip"
                type="text"
                value={config.esp32IpAddress}
                onChange={(e) => updateConfig('esp32IpAddress', e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="esp32-port">Porta do ESP32</Label>
              <Input
                id="esp32-port"
                type="text"
                value={config.esp32Port}
                onChange={(e) => updateConfig('esp32Port', e.target.value)}
                placeholder="80"
              />
            </div>
          </div>

          <Separator />

          <h4 className="font-medium text-sm">Configuração das Portas GPIO</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="external-loop">Porta Laço Externo</Label>
              <Input
                id="external-loop"
                type="text"
                value={config.externalLoopPort}
                onChange={(e) => updateConfig('externalLoopPort', e.target.value)}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal-loop">Porta Laço Interno</Label>
              <Input
                id="internal-loop"
                type="text"
                value={config.internalLoopPort}
                onChange={(e) => updateConfig('internalLoopPort', e.target.value)}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gate-control">Porta Controle Portão</Label>
              <Input
                id="gate-control"
                type="text"
                value={config.gateControlPort}
                onChange={(e) => updateConfig('gateControlPort', e.target.value)}
                placeholder="4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações da Câmera */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Configurações da Câmera
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="camera-url">URL da Câmera</Label>
            <Input
              id="camera-url"
              type="url"
              value={config.cameraUrl}
              onChange={(e) => updateConfig('cameraUrl', e.target.value)}
              placeholder="http://192.168.1.101:8080/video"
            />
            <p className="text-sm text-muted-foreground">
              URL completa para acesso ao stream da câmera (MJPEG, RTSP, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do PlatRecognizer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configurações do PlatRecognizer
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={config.platRecognizerApiKey}
              onChange={(e) => updateConfig('platRecognizerApiKey', e.target.value)}
              placeholder="Sua API Key do PlatRecognizer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license-key">License Key</Label>
            <Input
              id="license-key"
              type="password"
              value={config.platRecognizerLicenseKey}
              onChange={(e) => updateConfig('platRecognizerLicenseKey', e.target.value)}
              placeholder="Sua License Key do PlatRecognizer"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Obtenha suas chaves em{' '}
            <a 
              href="https://platerecognizer.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              platerecognizer.com
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="polling">Intervalo de Polling (ms)</Label>
              <Input
                id="polling"
                type="number"
                value={config.pollingInterval}
                onChange={(e) => updateConfig('pollingInterval', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retries">Máximo de Tentativas</Label>
              <Input
                id="retries"
                type="number"
                min="1"
                max="10"
                value={config.maxRetries}
                onChange={(e) => updateConfig('maxRetries', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reconnect">Reconexão Automática</Label>
              <Switch
                id="auto-reconnect"
                checked={config.autoReconnect}
                onCheckedChange={(checked) => updateConfig('autoReconnect', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode">Modo Debug</Label>
              <Switch
                id="debug-mode"
                checked={config.debugMode}
                onCheckedChange={(checked) => updateConfig('debugMode', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <Button 
        onClick={handleSave} 
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Salvar Todas as Configurações
      </Button>
    </div>
  );
};
