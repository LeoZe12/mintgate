
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Camera, Cpu } from 'lucide-react';

export const DeviceMonitor: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Monitor de Dispositivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>Câmera</span>
          </div>
          <Badge variant="default">Online</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            <span>ESP32</span>
          </div>
          <Badge variant="default">Funcionando</Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Sistema operacional normalmente</p>
          <p>Última verificação: {new Date().toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};
