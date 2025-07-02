
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEsp32Status } from '@/hooks/useEsp32Status';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export const Esp32Status: React.FC = () => {
  try {
    const { status, isLoading, error } = useEsp32Status();

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.connected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status ESP32
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 animate-spin" />
              <span>Verificando conexão...</span>
            </div>
          ) : error ? (
            <Badge variant="destructive">Erro: {error.message}</Badge>
          ) : status ? (
            <div className="space-y-2">
              <Badge variant={status.connected ? "default" : "destructive"}>
                {status.connected ? "Conectado" : "Desconectado"}
              </Badge>
              {status.lastHeartbeat && (
                <p className="text-sm text-muted-foreground">
                  Último heartbeat: {new Date(status.lastHeartbeat).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <Badge variant="secondary">Status desconhecido</Badge>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error in Esp32Status component:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status ESP32</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive">Erro ao carregar status</Badge>
        </CardContent>
      </Card>
    );
  }
};
