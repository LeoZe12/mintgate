
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, Database, Usb, Download, Upload, Trash2 } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useToast } from '@/hooks/use-toast';

export const OfflineSystemStatus: React.FC = () => {
  const { isInitialized, initializeStorage, exportData, importData, clearAllData } = useOfflineStorage();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!isInitialized) {
      initializeStorage();
    }
  }, [isInitialized, initializeStorage]);

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
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Armazenamento Local</span>
          </div>
          <Badge variant="default">Ativo</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Usb className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Conexão ESP32</span>
          </div>
          <Badge variant="secondary">USB Serial</Badge>
        </div>

        <div className="pt-4 border-t space-y-2">
          <h4 className="font-medium text-sm">Gerenciamento de Dados</h4>
          
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

        <div className="text-xs text-muted-foreground">
          <p>• Todos os dados são armazenados localmente</p>
          <p>• Não requer conexão com a internet</p>
          <p>• ESP32 conectado via USB Serial</p>
          <p>• Backup automático disponível</p>
        </div>
      </CardContent>
    </Card>
  );
};
