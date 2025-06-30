
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Camera, Cpu, Network, Key } from 'lucide-react';
import { ESP32_CONFIG, Esp32ConfigType, validateConfig } from '@/config/esp32Config';

export const SystemConfig: React.FC = () => {
  const [config, setConfig] = useState<Esp32ConfigType>(ESP32_CONFIG);
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
    // Validar configurações antes de salvar
    if (!validateConfig(config)) {
      toast({
        title: "Erro de Validação",
        description: "Verifique as configurações inseridas.",
        variant: "destructive",
      });
      return;
    }

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
          description: "As configurações foram atualizadas com sucesso. Reinicie o sistema para aplicar as mudanças.",
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

  const updateConfig = (section: keyof Esp32ConfigType, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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
                value={config.esp32.ipAddress}
                onChange={(e) => updateConfig('esp32', 'ipAddress', e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="esp32-port">Porta do ESP32</Label>
              <Input
                id="esp32-port"
                type="text"
                value={config.esp32.port}
                onChange={(e) => updateConfig('esp32', 'port', e.target.value)}
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
                value={config.gpio.externalLoopPort}
                onChange={(e) => updateConfig('gpio', 'externalLoopPort', e.target.value)}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal-loop">Porta Laço Interno</Label>
              <Input
                id="internal-loop"
                type="text"
                value={config.gpio.internalLoopPort}
                onChange={(e) => updateConfig('gpio', 'internalLoopPort', e.target.value)}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gate-control">Porta Controle Portão</Label>
              <Input
                id="gate-control"
                type="text"
                value={config.gpio.gateControlPort}
                onChange={(e) => updateConfig('gpio', 'gateControlPort', e.target.value)}
                placeholder="4"
              />
            </div>
          </div>

          <Separator />

          <h4 className="font-medium text-sm">Configurações Avançadas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="polling">Intervalo de Polling (ms)</Label>
              <Input
                id="polling"
                type="number"
                value={config.esp32.pollingInterval}
                onChange={(e) => updateConfig('esp32', 'pollingInterval', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retries">Máximo de Tentativas</Label>
              <Input
                id="retries"
                type="number"
                min="1"
                max="10"
                value={config.esp32.maxRetries}
                onChange={(e) => updateConfig('esp32', 'maxRetries', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reconnect">Reconexão Automática</Label>
              <Switch
                id="auto-reconnect"
                checked={config.esp32.autoReconnect}
                onCheckedChange={(checked) => updateConfig('esp32', 'autoReconnect', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode">Modo Debug</Label>
              <Switch
                id="debug-mode"
                checked={config.esp32.debugMode}
                onCheckedChange={(checked) => updateConfig('esp32', 'debugMode', checked)}
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
              value={config.camera.url}
              onChange={(e) => updateConfig('camera', 'url', e.target.value)}
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
              value={config.platRecognizer.apiKey}
              onChange={(e) => updateConfig('platRecognizer', 'apiKey', e.target.value)}
              placeholder="Sua API Key do PlatRecognizer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license-key">License Key</Label>
            <Input
              id="license-key"
              type="password"
              value={config.platRecognizer.licenseKey}
              onChange={(e) => updateConfig('platRecognizer', 'licenseKey', e.target.value)}
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

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Como Usar</h4>
        <p className="text-sm text-blue-800">
          Para alterar configurações em todo o sistema, você pode:
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>• Modificar este formulário e salvar</li>
          <li>• Editar diretamente o arquivo <code>src/config/esp32Config.ts</code></li>
          <li>• As mudanças serão aplicadas automaticamente em todo o sistema</li>
        </ul>
      </div>
    </div>
  );
};
