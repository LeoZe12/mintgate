
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Cpu, Thermometer, Zap, RefreshCw } from 'lucide-react';

interface DeviceMetrics {
  cpuUsage: number;
  temperature: number;
  voltage: number;
  uptime: number;
  memoryUsage: number;
}

export const DeviceMonitor: React.FC = () => {
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['device-metrics'],
    queryFn: async (): Promise<DeviceMetrics> => {
      const response = await fetch('/api/esp32/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 40) return { color: 'bg-green-500', text: 'Normal' };
    if (temp < 60) return { color: 'bg-yellow-500', text: 'Atenção' };
    return { color: 'bg-red-500', text: 'Crítico' };
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Monitor do Dispositivo
          </span>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando métricas...</p>
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CPU:</span>
              <div className="flex items-center gap-2">
                <div className="w-12 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${metrics.cpuUsage}%` }}
                  ></div>
                </div>
                <span className="text-sm">{metrics.cpuUsage}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Thermometer className="h-4 w-4" />
                Temp:
              </span>
              <div className="flex items-center gap-2">
                <Badge className={getTemperatureStatus(metrics.temperature).color}>
                  {getTemperatureStatus(metrics.temperature).text}
                </Badge>
                <span className="text-sm">{metrics.temperature}°C</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Voltagem:
              </span>
              <span className="text-sm font-semibold">{metrics.voltage}V</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uptime:</span>
              <span className="text-sm">{formatUptime(metrics.uptime)}</span>
            </div>

            <div className="col-span-2 flex items-center justify-between">
              <span className="text-sm font-medium">Memória:</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${metrics.memoryUsage}%` }}
                  ></div>
                </div>
                <span className="text-sm">{metrics.memoryUsage}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Falha ao carregar métricas do dispositivo
          </div>
        )}
      </CardContent>
    </Card>
  );
};
