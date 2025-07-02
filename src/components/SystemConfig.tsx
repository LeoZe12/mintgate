
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Wifi, Camera, Shield, TestTube } from 'lucide-react';
import { ESP32_CONFIG } from '@/config/esp32Config';
import { PlateRecognizerTest } from '@/components/PlateRecognizerTest';
import { useToast } from '@/hooks/use-toast';

export const SystemConfig: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState(ESP32_CONFIG);

  const handleSaveConfig = () => {
    toast({
      title: "Configuração Salva",
      description: "As configurações foram salvas com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="esp32" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="esp32">ESP32</TabsTrigger>
              <TabsTrigger value="camera">Câmera</TabsTrigger>
              <TabsTrigger value="plate">Reconhecimento</TabsTrigger>
              <TabsTrigger value="test">Testes</TabsTrigger>
            </TabsList>

            <TabsContent value="esp32" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="esp32-ip">Endereço IP</Label>
                  <Input
                    id="esp32-ip"
                    value={config.esp32.ipAddress}
                    onChange={(e) => setConfig({
                      ...config,
                      esp32: { ...config.esp32, ipAddress: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esp32-port">Porta</Label>
                  <Input
                    id="esp32-port"
                    type="number"
                    value={config.esp32.port}
                    onChange={(e) => setConfig({
                      ...config,
                      esp32: { ...config.esp32, port: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="debug-mode"
                  checked={config.esp32.debugMode}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    esp32: { ...config.esp32, debugMode: checked }
                  })}
                />
                <Label htmlFor="debug-mode">Modo Debug</Label>
              </div>
            </TabsContent>

            <TabsContent value="camera" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="camera-url">URL da Câmera</Label>
                <Input
                  id="camera-url"
                  value={config.camera.url}
                  onChange={(e) => setConfig({
                    ...config,
                    camera: { ...config.camera, url: e.target.value }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qualidade</Label>
                  <Badge>{config.camera.quality}</Badge>
                </div>
                <div className="space-y-2">
                  <Label>FPS</Label>
                  <Badge>{config.camera.fps}</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plate" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="offline-mode"
                  checked={config.platRecognizerOffline.enabled}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    platRecognizerOffline: { ...config.platRecognizerOffline, enabled: checked }
                  })}
                />
                <Label htmlFor="offline-mode">Usar SDK Offline</Label>
                <Badge variant={config.platRecognizerOffline.enabled ? "default" : "secondary"}>
                  {config.platRecognizerOffline.enabled ? "Offline" : "Online"}
                </Badge>
              </div>

              {config.platRecognizerOffline.enabled ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="offline-endpoint">Endpoint Offline</Label>
                    <Input
                      id="offline-endpoint"
                      value={config.platRecognizerOffline.endpoint}
                      onChange={(e) => setConfig({
                        ...config,
                        platRecognizerOffline: { ...config.platRecognizerOffline, endpoint: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offline-license">License Key</Label>
                    <Input
                      id="offline-license"
                      value={config.platRecognizerOffline.licenseKey}
                      onChange={(e) => setConfig({
                        ...config,
                        platRecognizerOffline: { ...config.platRecognizerOffline, licenseKey: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offline-token">API Token</Label>
                    <Input
                      id="offline-token"
                      value={config.platRecognizerOffline.apiToken}
                      onChange={(e) => setConfig({
                        ...config,
                        platRecognizerOffline: { ...config.platRecognizerOffline, apiToken: e.target.value }
                      })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={config.platRecognizer.apiKey}
                      onChange={(e) => setConfig({
                        ...config,
                        platRecognizer: { ...config.platRecognizer, apiKey: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license-key">License Key</Label>
                    <Input
                      id="license-key"
                      value={config.platRecognizer.licenseKey}
                      onChange={(e) => setConfig({
                        ...config,
                        platRecognizer: { ...config.platRecognizer, licenseKey: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <PlateRecognizerTest />
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button onClick={handleSaveConfig}>
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
