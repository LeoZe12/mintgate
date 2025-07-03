import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Usb, Camera, Shield, TestTube } from 'lucide-react';
import { ESP32_CONFIG } from '@/config/esp32Config';
import { PlateRecognizerTest } from '@/components/PlateRecognizerTest';
import { PlateRecognizerConfig } from '@/components/PlateRecognizerConfig';
import { useToast } from '@/hooks/use-toast';
import { EnhancedConfigPanel } from '@/components/EnhancedConfigPanel';
import { VideoCaptureComponent } from '@/components/VideoCaptureComponent';

export const SystemConfig: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState(ESP32_CONFIG);

  const handleSaveConfig = () => {
    toast({
      title: "Configuração Salva",
      description: "As configurações foram salvas com sucesso.",
    });
  };

  const commonSerialPorts = [
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8',
    '/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0', '/dev/ttyACM1'
  ];

  const commonBaudRates = [
    9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600
  ];

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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="esp32">ESP32</TabsTrigger>
              <TabsTrigger value="camera">Câmera</TabsTrigger>
              <TabsTrigger value="plate">Reconhecimento</TabsTrigger>
              <TabsTrigger value="offline">SDK Offline</TabsTrigger>
              <TabsTrigger value="enhanced">Avançado</TabsTrigger>
              <TabsTrigger value="video">Vídeo</TabsTrigger>
              <TabsTrigger value="test">Testes</TabsTrigger>
            </TabsList>

            <TabsContent value="esp32" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial-port">Porta Serial</Label>
                  <Select
                    value={config.esp32.serialPort}
                    onValueChange={(value) => setConfig({
                      ...config,
                      esp32: { ...config.esp32, serialPort: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a porta serial" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonSerialPorts.map((port) => (
                        <SelectItem key={port} value={port}>
                          {port}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baud-rate">Baud Rate</Label>
                  <Select
                    value={config.esp32.baudRate.toString()}
                    onValueChange={(value) => setConfig({
                      ...config,
                      esp32: { ...config.esp32, baudRate: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o baud rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonBaudRates.map((rate) => (
                        <SelectItem key={rate} value={rate.toString()}>
                          {rate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={config.esp32.timeout}
                    onChange={(e) => setConfig({
                      ...config,
                      esp32: { ...config.esp32, timeout: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="polling-interval">Intervalo de Polling (ms)</Label>
                  <Input
                    id="polling-interval"
                    type="number"
                    value={config.esp32.pollingInterval}
                    onChange={(e) => setConfig({
                      ...config,
                      esp32: { ...config.esp32, pollingInterval: parseInt(e.target.value) }
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-reconnect"
                  checked={config.esp32.autoReconnect}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    esp32: { ...config.esp32, autoReconnect: checked }
                  })}
                />
                <Label htmlFor="auto-reconnect">Reconexão Automática</Label>
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

            <TabsContent value="offline" className="space-y-4">
              <PlateRecognizerConfig />
            </TabsContent>

            <TabsContent value="enhanced" className="space-y-4">
              <EnhancedConfigPanel />
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <VideoCaptureComponent />
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
