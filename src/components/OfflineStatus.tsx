import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  Clock,
  Smartphone
} from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export const OfflineStatus: React.FC = () => {
  const {
    isOnline,
    isInstallable,
    queueSize,
    installPWA,
    syncPendingData
  } = useOfflineSync();

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status de Conexão */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            {/* Queue de Sincronização */}
            {queueSize > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <Badge variant="secondary">
                  {queueSize} pendente{queueSize > 1 ? 's' : ''}
                </Badge>
              </div>
            )}

            {/* PWA Install */}
            {isInstallable && (
              <Badge variant="outline" className="text-blue-600">
                <Smartphone className="h-3 w-3 mr-1" />
                Instalar App
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sincronização Manual */}
            {queueSize > 0 && isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={syncPendingData}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Sincronizar
              </Button>
            )}

            {/* Install PWA */}
            {isInstallable && (
              <Button
                variant="outline"
                size="sm"
                onClick={installPWA}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Instalar
              </Button>
            )}
          </div>
        </div>

        {!isOnline && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Modo Offline:</strong> O app continua funcionando com dados em cache. 
              Suas ações serão sincronizadas quando você voltar online.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};