
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Wifi, Globe, Router } from 'lucide-react';

interface NetworkInfo {
  ip: string;
  ssid: string;
  signalStrength: number;
  macAddress: string;
  gateway: string;
  dns: string;
}

export const NetworkInfo: React.FC = () => {
  const { data: networkInfo, isLoading } = useQuery({
    queryKey: ['network-info'],
    queryFn: async (): Promise<NetworkInfo> => {
      const response = await fetch('/api/esp32/network');
      if (!response.ok) throw new Error('Failed to fetch network info');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const getSignalStrengthColor = (strength: number) => {
    if (strength > -50) return 'bg-green-500';
    if (strength > -70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSignalBars = (strength: number) => {
    const bars = Math.max(1, Math.min(4, Math.floor((strength + 100) / 12.5)));
    return bars;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Informações de Rede
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando informações...</p>
          </div>
        ) : networkInfo ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                IP:
              </span>
              <span className="text-sm font-mono">{networkInfo.ip}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SSID:</span>
              <span className="text-sm font-semibold">{networkInfo.ssid}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sinal WiFi:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 bg-gray-300 ${
                        bar <= getSignalBars(networkInfo.signalStrength)
                          ? getSignalStrengthColor(networkInfo.signalStrength)
                          : ''
                      }`}
                      style={{ height: `${bar * 4}px` }}
                    />
                  ))}
                </div>
                <span className="text-sm">{networkInfo.signalStrength} dBm</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">MAC:</span>
              <span className="text-sm font-mono">{networkInfo.macAddress}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Router className="h-4 w-4" />
                Gateway:
              </span>
              <span className="text-sm font-mono">{networkInfo.gateway}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">DNS:</span>
              <span className="text-sm font-mono">{networkInfo.dns}</span>
            </div>

            <div className="pt-2 border-t">
              <Badge 
                className={networkInfo.signalStrength > -70 ? 'bg-green-500' : 'bg-yellow-500'}
              >
                {networkInfo.signalStrength > -70 ? 'Conexão Estável' : 'Sinal Fraco'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Falha ao carregar informações de rede
          </div>
        )}
      </CardContent>
    </Card>
  );
};
