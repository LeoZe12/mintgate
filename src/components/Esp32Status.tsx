
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEsp32Status } from '@/hooks/useEsp32Status';
import { Loader2, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export const Esp32Status: React.FC = () => {
  const { status, lastHeartbeat, isLoading, openGate, closeGate, refresh } = useEsp32Status();

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'disconnected':
        return 'text-red-500';
      case 'error':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const formatHeartbeat = (heartbeat: string | null) => {
    if (!heartbeat) return 'Nunca';
    
    try {
      const date = new Date(heartbeat);
      return date.toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Status ESP32
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Connection */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Conexão:</span>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Last Heartbeat */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Último Heartbeat:</span>
          <span className="text-sm text-gray-800">
            {formatHeartbeat(lastHeartbeat)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            onClick={openGate}
            disabled={isLoading || status !== 'connected'}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Abrir Portão'
            )}
          </Button>
          
          <Button
            onClick={closeGate}
            disabled={isLoading || status !== 'connected'}
            variant="destructive"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Fechar Portão'
            )}
          </Button>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={refresh}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Atualizar Status
        </Button>
      </CardContent>
    </Card>
  );
};

export default Esp32Status;
