
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, Globe, Router, Signal } from 'lucide-react';
import { ESP32_CONFIG } from '@/config/esp32Config';

export const NetworkInfo: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Informações de Rede
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Router className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">ESP32</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {ESP32_CONFIG.esp32.ipAddress}:{ESP32_CONFIG.esp32.port}
            </p>
            <Badge variant="default">Conectado</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Plate Recognizer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {ESP32_CONFIG.platRecognizerOffline.enabled ? 'SDK Offline' : 'API Online'}
            </p>
            <Badge variant={ESP32_CONFIG.platRecognizerOffline.enabled ? "secondary" : "default"}>
              {ESP32_CONFIG.platRecognizerOffline.enabled ? 'Local' : 'Cloud'}
            </Badge>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Signal className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Status da Conexão</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Latência: ~50ms</div>
            <div>Uptime: 99.8%</div>
            <div>Requests/min: 15</div>
            <div>Última sync: agora</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
