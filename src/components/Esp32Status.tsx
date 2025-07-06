
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEsp32Status } from '@/hooks/useEsp32Status';
import { Usb, WifiOff, Activity, DoorOpen, DoorClosed, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Esp32Status: React.FC = () => {
  const { toast } = useToast();
  
  try {
    const { status, isLoading, error, openGate, closeGate, refresh } = useEsp32Status();

    const handleOpenGate = async () => {
      try {
        await openGate();
        toast({
          title: "Portão Aberto",
          description: "Comando enviado com sucesso via USB Serial",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao abrir portão: " + (error as Error).message,
          variant: "destructive",
        });
      }
    };

    const handleCloseGate = async () => {
      try {
        await closeGate();
        toast({
          title: "Portão Fechado",
          description: "Comando enviado com sucesso via USB Serial",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao fechar portão: " + (error as Error).message,
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.connected ? (
              <Usb className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status ESP32 (Offline)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 animate-spin" />
              <span>Verificando conexão USB...</span>
            </div>
          ) : error ? (
            <div className="space-y-2">
              <Badge variant="destructive">Erro de Conexão</Badge>
              <p className="text-sm text-red-600">{error.message}</p>
              <p className="text-xs text-muted-foreground">
                Verifique se o servidor bridge está rodando em localhost:3001
              </p>
            </div>
          ) : status ? (
            <div className="space-y-3">
              <Badge variant={status.connected ? "default" : "destructive"}>
                {status.connected ? "Conectado via USB" : "Desconectado"}
              </Badge>
              
              {status.lastHeartbeat && (
                <p className="text-sm text-muted-foreground">
                  Último sinal: {new Date(status.lastHeartbeat).toLocaleString()}
                </p>
              )}

              {status.connected && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleOpenGate}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <DoorOpen className="h-3 w-3" />
                    Abrir Portão
                  </Button>
                  
                  <Button
                    onClick={handleCloseGate}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <DoorClosed className="h-3 w-3" />
                    Fechar Portão
                  </Button>
                  
                  <Button
                    onClick={refresh}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Atualizar
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Badge variant="secondary">Status desconhecido</Badge>
          )}

          <div className="pt-3 border-t text-xs text-muted-foreground">
            <p>💡 Sistema funcionando completamente offline</p>
            <p>🔌 ESP32 conectado via cabo USB Serial</p>
            <p>📡 Sem dependência de internet</p>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error in Esp32Status component:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status ESP32 (Offline)</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive">Erro ao carregar status</Badge>
        </CardContent>
      </Card>
    );
  }
};
