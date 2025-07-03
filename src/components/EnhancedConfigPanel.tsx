
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Settings, Database, FileText, BarChart3 } from 'lucide-react';
import { enhancedPlateRecognizerService } from '@/services/enhancedPlateRecognizerService';
import { fileSystemLogger } from '@/services/fileSystemLogger';
import { performanceMetricsService } from '@/services/performanceMetrics';
import { useToast } from '@/hooks/use-toast';

const AVAILABLE_REGIONS = [
  { code: 'br', name: 'Brasil' },
  { code: 'us', name: 'Estados Unidos' },
  { code: 'eu', name: 'Europa' },
  { code: 'in', name: 'Índia' },
  { code: 'kr', name: 'Coreia do Sul' },
  { code: 'mx', name: 'México' },
];

export const EnhancedConfigPanel: React.FC = () => {
  const [config, setConfig] = useState({
    confidenceThreshold: 0.7,
    regions: ['br'],
    useCache: true,
    enableMetrics: true,
    enableFileLogging: true,
    timeoutMs: 30000,
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  });

  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar estatísticas de performance
    const stats = enhancedPlateRecognizerService.getPerformanceStats();
    setPerformanceStats(stats);
  }, []);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    enhancedPlateRecognizerService.updateConfig({
      confidenceThreshold: newConfig.confidenceThreshold,
      regions: newConfig.regions,
      useCache: newConfig.useCache,
      enableMetrics: newConfig.enableMetrics,
      enableFileLogging: newConfig.enableFileLogging,
      timeoutMs: newConfig.timeoutMs,
      retryConfig: {
        maxRetries: newConfig.maxRetries,
        initialDelay: newConfig.initialDelay,
        maxDelay: newConfig.maxDelay,
      },
    });
  };

  const handleRegionToggle = (regionCode: string) => {
    const newRegions = config.regions.includes(regionCode)
      ? config.regions.filter(r => r !== regionCode)
      : [...config.regions, regionCode];
    
    if (newRegions.length > 0) {
      handleConfigChange('regions', newRegions);
    }
  };

  const handleInitializeFileLogging = async () => {
    try {
      await enhancedPlateRecognizerService.initializeFileLogging();
      toast({
        title: "Logging Inicializado",
        description: "Sistema de logs em arquivo ativado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível inicializar o sistema de logs",
        variant: "destructive",
      });
    }
  };

  const handleClearCache = async () => {
    try {
      await enhancedPlateRecognizerService.clearCache();
      toast({
        title: "Cache Limpo",
        description: "Cache de reconhecimento foi limpo com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao limpar cache: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleExportMetrics = () => {
    try {
      const csvData = enhancedPlateRecognizerService.exportMetrics();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plate_recognition_metrics_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Métricas Exportadas",
        description: "Arquivo CSV baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar métricas",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Threshold de Confiança */}
          <div className="space-y-2">
            <Label>Threshold de Confiança: {(config.confidenceThreshold * 100).toFixed(0)}%</Label>
            <Slider
              value={[config.confidenceThreshold]}
              onValueChange={([value]) => handleConfigChange('confidenceThreshold', value)}
              min={0.1}
              max={1.0}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Regiões Suportadas */}
          <div className="space-y-2">
            <Label>Regiões de Reconhecimento</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_REGIONS.map(region => (
                <Badge
                  key={region.code}
                  variant={config.regions.includes(region.code) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleRegionToggle(region.code)}
                >
                  {region.name} ({region.code.toUpperCase()})
                </Badge>
              ))}
            </div>
          </div>

          {/* Configurações de Timeout e Retry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={config.timeoutMs}
                onChange={(e) => handleConfigChange('timeoutMs', parseInt(e.target.value) || 30000)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-retries">Máx. Tentativas</Label>
              <Input
                id="max-retries"
                type="number"
                min="1"
                max="10"
                value={config.maxRetries}
                onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value) || 3)}
              />
            </div>
          </div>

          {/* Switches de Funcionalidades */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cache Local</Label>
                <p className="text-sm text-muted-foreground">
                  Usar IndexedDB para cache de resultados
                </p>
              </div>
              <Switch
                checked={config.useCache}
                onCheckedChange={(checked) => handleConfigChange('useCache', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Métricas de Performance</Label>
                <p className="text-sm text-muted-foreground">
                  Coletar dados de latência e sucesso
                </p>
              </div>
              <Switch
                checked={config.enableMetrics}
                onCheckedChange={(checked) => handleConfigChange('enableMetrics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Logs em Arquivo</Label>
                <p className="text-sm text-muted-foreground">
                  Salvar logs usando File System Access API
                </p>
              </div>
              <Switch
                checked={config.enableFileLogging}
                onCheckedChange={(checked) => handleConfigChange('enableFileLogging', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Performance */}
      {performanceStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {performanceStats.averageLatency?.toFixed(0) || 0}ms
                </p>
                <p className="text-sm text-muted-foreground">Latência Média</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {performanceStats.successRate?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {performanceStats.totalOperations || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total de Operações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {performanceStats.cachedOperations || 0}
                </p>
                <p className="text-sm text-muted-foreground">Resultados em Cache</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações de Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Manutenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleInitializeFileLogging} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Inicializar Logs
            </Button>
            
            <Button onClick={handleClearCache} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
            
            <Button onClick={handleExportMetrics} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Exportar Métricas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
