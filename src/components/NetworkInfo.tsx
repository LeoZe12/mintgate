
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Database, Usb, HardDrive } from 'lucide-react';
import { ESP32_CONFIG, getSerialConnectionInfo } from '@/config/esp32Config';

export const NetworkInfo: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-green-500" />
          Sistema Offline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Usb className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">ESP32 Serial</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {getSerialConnectionInfo()}
            </p>
            <Badge variant="default">Conectado via USB</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Plate Recognizer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              SDK Offline Local
            </p>
            <Badge variant="secondary">Offline</Badge>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Armazenamento de Dados</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Tipo: LocalStorage</div>
            <div>Status: Ativo</div>
            <div>Backup: Disponível</div>
            <div>Internet: Não Necessária</div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Usb className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Configuração Serial</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Porta: {ESP32_CONFIG.esp32.serialPort}</div>
            <div>Baud Rate: {ESP32_CONFIG.esp32.baudRate}</div>
            <div>Timeout: {ESP32_CONFIG.esp32.timeout}ms</div>
            <div>Polling: {ESP32_CONFIG.esp32.pollingInterval}ms</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
