
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { usePlateRecognizer } from '@/hooks/usePlateRecognizer';
import { useToast } from '@/hooks/use-toast';

export const PlateRecognizerConfig: React.FC = () => {
  const { testConnection, updateEndpoint, isOfflineMode, currentEndpoint } = usePlateRecognizer();
  const { toast } = useToast();
  
  const [config, setConfig] = useState({
    host: 'localhost',
    port: 8081,
    path: '/v1/plate-reader/',
    enabled: isOfflineMode,
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  const buildEndpoint = () => {
    return `http://${config.host}:${config.port}${config.path}`;
  };

  const handleSaveConfig = () => {
    const newEndpoint = buildEndpoint();
    updateEndpoint(newEndpoint);
    
    toast({
      title: "Configuração Salva",
      description: `Endpoint atualizado para: ${newEndpoint}`,
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Salvar configuração temporariamente para teste
      const tempEndpoint = buildEndpoint();
      updateEndpoint(tempEndpoint);
      
      const isConnected = await testConnection();
      setConnectionStatus(isConnected);
      
      toast({
        title: isConnected ? "Conexão OK" : "Conexão Falhou",
        description: isConnected 
          ? "SDK offline está respondendo corretamente!"
          : "Não foi possível conectar ao SDK offline. Verifique se o serviço está rodando.",
        variant: isConnected ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus(false);
      toast({
        title: "Erro de Conexão",
        description: "Erro ao testar conexão: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração do Plate Recognizer SDK
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status atual */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Status Atual</Label>
            <p className="text-sm text-muted-foreground">{currentEndpoint}</p>
          </div>
          <Badge variant={config.enabled ? "default" : "secondary"}>
            {config.enabled ? "SDK Offline" : "Desabilitado"}
          </Badge>
        </div>

        {/* Configurações do endpoint */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="offline-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
            <Label htmlFor="offline-enabled">Usar SDK Offline</Label>
          </div>

          {config.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={config.host}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 8081 })}
                    placeholder="8081"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="path">Path</Label>
                <Input
                  id="path"
                  value={config.path}
                  onChange={(e) => setConfig({ ...config, path: e.target.value })}
                  placeholder="/v1/plate-reader/"
                />
              </div>

              <div className="space-y-2">
                <Label>Endpoint Resultante</Label>
                <Input
                  value={buildEndpoint()}
                  readOnly
                  className="bg-gray-50 font-mono text-sm"
                />
              </div>
            </>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button onClick={handleSaveConfig} className="flex-1">
            Salvar Configuração
          </Button>
          
          {config.enabled && (
            <Button 
              onClick={handleTestConnection} 
              disabled={isTestingConnection}
              variant="outline"
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : connectionStatus === true ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : connectionStatus === false ? (
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              {isTestingConnection ? "Testando..." : "Testar"}
            </Button>
          )}
        </div>

        {connectionStatus !== null && (
          <div className="flex items-center gap-2">
            {connectionStatus ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {connectionStatus ? "SDK offline está funcionando" : "SDK offline não está acessível"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
