
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save } from 'lucide-react';

export const SystemConfig: React.FC = () => {
  const [config, setConfig] = useState({
    pollingInterval: 5000,
    autoReconnect: true,
    debugMode: false,
    maxRetries: 3,
    wifiSSID: '',
    wifiPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
          title: "Configuração salva",
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Sistema
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="polling">Intervalo de Polling (ms)</Label>
            <Input
              id="polling"
              type="number"
              value={config.pollingInterval}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                pollingInterval: parseInt(e.target.value)
              }))}
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
              onChange={(e) => setConfig(prev => ({
                ...prev,
                maxRetries: parseInt(e.target.value)
              }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-reconnect">Reconexão Automática</Label>
            <Switch
              id="auto-reconnect"
              checked={config.autoReconnect}
              onCheckedChange={(checked) => setConfig(prev => ({
                ...prev,
                autoReconnect: checked
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="debug-mode">Modo Debug</Label>
            <Switch
              id="debug-mode"
              checked={config.debugMode}
              onCheckedChange={(checked) => setConfig(prev => ({
                ...prev,
                debugMode: checked
              }))}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Configurações de Rede</h3>
          
          <div className="space-y-2">
            <Label htmlFor="wifi-ssid">SSID do WiFi</Label>
            <Input
              id="wifi-ssid"
              type="text"
              value={config.wifiSSID}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                wifiSSID: e.target.value
              }))}
              placeholder="Nome da rede WiFi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifi-password">Senha do WiFi</Label>
            <Input
              id="wifi-password"
              type="password"
              value={config.wifiPassword}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                wifiPassword: e.target.value
              }))}
              placeholder="Senha da rede WiFi"
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
};
