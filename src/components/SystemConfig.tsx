
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Camera, Cpu, Network, Key } from 'lucide-react';
import { ESP32_CONFIG, Esp32ConfigType, updateConfig } from '@/config/esp32Config';

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
    try {
      // Validar configurações usando o sistema de validação
      const validatedConfig = updateConfig(config);
      
      setIsLoading(true);
      
      const response = await fetch('/api/esp32/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedConfig),
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
        title: "Erro de Validação",
        description: error instanceof Error ? error.message : "Verifique as configurações inseridas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfigValue = (section: keyof Esp32ConfigType, key: string, value: any) => {
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
                onChange={(e) => updateConfigValue('esp32', 'ipAddress', e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="esp32-port">Porta do ESP32</Label>
              <Input
                id="esp32-port"
                type="number"
                min="1"
                max="65535"
                value={config.esp32.port}
                onChange={(e) => updateConfigValue('esp32', 'port', parseInt(e.target.value) || 80)}
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
                type="number"
                min="0"
                max="39"
                value={config.gpio.externalLoopPort}
                onChange={(e) => updateConfigValue('gpio', 'externalLoopPort', parseInt(e.target.value) || 2)}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal-loop">Porta Laço Interno</Label>
              <Input
                id="internal-loop"
                type="number"
                min="0"
                max="39"
                value={config.gpio.internalLoopPort}
                onChange={(e) => updateConfigValue('gpio', 'internalLoopPort', parseInt(e.target.value) || 3)}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gate-control">Porta Controle Portão</Label>
              <Input
                id="gate-control"
                type="number"
                min="0"
                max="39"
                value={config.gpio.gateControlPort}
                onChange={(e) => updateConfigValue('gpio', 'gateControlPort', parseInt(e.target.value) || 4)}
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
                min="1000"
                value={config.esp32.pollingInterval}
                onChange={(e) => updateConfigValue('esp32', 'pollingInterval', parseInt(e.target.value) || 5000)}
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
                onChange={(e) => updateConfigValue('esp32', 'maxRetries', parseInt(e.target.value) || 3)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reconnect">Reconexão Automática</Label>
              <Switch
                id="auto-reconnect"
                checked={config.esp32.autoReconnect}
                onCheckedChange={(checked) => updateConfigValue('esp32', 'autoReconnect', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode">Modo Debug</Label>
              <Switch
                id="debug-mode"
                checked={config.esp32.debugMode}
                onCheckedChange={(checked) => updateConfigValue('esp32', 'debugMode', checked)}
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
              onChange={(e) => updateConfigValue('camera', 'url', e.target.value)}
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
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">⚠️ Configuração via Variáveis de Ambiente</h4>
            <p className="text-sm text-yellow-800">
              Por questões de segurança, as credenciais do PlatRecognizer devem ser configuradas como variáveis de ambiente:
            </p>
            <ul className="text-sm text-yellow-800 mt-2 space-y-1">
              <li>• <code>PLATERECOGNIZER_API_KEY</code> - Sua API Key</li>
              <li>• <code>PLATERECOGNIZER_LICENSE_KEY</code> - Sua License Key</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Status das Credenciais</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border ${config.platRecognizer.apiKey ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-sm font-medium ${config.platRecognizer.apiKey ? 'text-green-800' : 'text-red-800'}`}>
                  API Key: {config.platRecognizer.apiKey ? '✓ Configurada' : '✗ Não configurada'}
                </p>
              </div>
              <div className={`p-3 rounded-lg border ${config.platRecognizer.licenseKey ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-sm font-medium ${config.platRecognizer.licenseKey ? 'text-green-800' : 'text-red-800'}`}>
                  License Key: {config.platRecognizer.licenseKey ? '✓ Configurada' : '✗ Não configurada'}
                </p>
              </div>
            </div>
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
    </div>
  );
};
