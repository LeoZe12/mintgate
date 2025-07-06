
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEsp32Status } from '@/hooks/useEsp32Status';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useToast } from '@/hooks/use-toast';
import { 
  WifiOff, 
  Usb, 
  Camera, 
  Database, 
  DoorOpen, 
  DoorClosed, 
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

export const SystemStatus: React.FC = () => {
  const { status, isLoading, error, openGate, closeGate, refresh } = useEsp32Status();
  const { exportData, importData, clearAllData } = useOfflineStorage();
  const { toast } = useToast();

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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file)
        .then(() => {
          toast({
            title: "Importação Concluída",
            description: "Dados importados com sucesso!",
          });
        })
        .catch((error) => {
          toast({
            title: "Erro na Importação",
            description: "Erro ao importar dados: " + error.message,
            variant: "destructive",
          });
        });
    }
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      clearAllData();
      toast({
        title: "Dados Limpos",
        description: "Todos os dados foram removidos com sucesso.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-green-500" />
          Sistema Offline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status dos Dispositivos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Usb className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">ESP32</span>
              </div>
              <Badge variant={status?.connected ? "default" : "destructive"}>
                {status?.connected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">COM3 @ 115200 baud</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Câmera</span>
              </div>
              <Badge variant="default">Online</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Plate Recognizer SDK</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Armazenamento</span>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            <p className="text-xs text-muted-foreground">LocalStorage</p>
          </div>
        </div>

        {/* Controle do Portão */}
        {status?.connected && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-3">Controle do Portão</h4>
            <div className="flex gap-2">
              <Button
                onClick={handleOpenGate}
                variant="default"
                size="sm"
                className="flex items-center gap-1"
              >
                <DoorOpen className="h-3 w-3" />
                Abrir
              </Button>
              
              <Button
                onClick={handleCloseGate}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <DoorClosed className="h-3 w-3" />
                Fechar
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
          </div>
        )}

        {/* Gerenciamento de Dados */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-3">Gerenciamento de Dados</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Exportar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="h-3 w-3" />
              Importar
            </Button>
            
            <Button
              onClick={handleClearData}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
              Limpar
            </Button>
          </div>

          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Status Summary */}
        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>• Sistema funcionando completamente offline</p>
          <p>• ESP32 conectado via USB Serial</p>
          <p>• Sem dependência de internet</p>
          <p>• Última verificação: {new Date().toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};
