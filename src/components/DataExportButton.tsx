
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useVehiclePlates } from '@/hooks/useVehiclePlates';
import { useAccessHistory } from '@/hooks/useAccessHistory';
import { useToast } from '@/hooks/use-toast';

export const DataExportButton = () => {
  const { saveToTextFile: savePlates } = useVehiclePlates();
  const { saveToTextFile: saveHistory } = useAccessHistory();
  const { toast } = useToast();

  const handleExportAll = () => {
    try {
      savePlates();
      saveHistory();
      toast({
        title: "Dados exportados",
        description: "Arquivos de placas e histórico foram baixados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Erro ao exportar os dados para arquivos .txt",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleExportAll} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Exportar Dados (.txt)
    </Button>
  );
};
