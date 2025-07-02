
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Esp32Status } from '@/components/Esp32Status';
import { DeviceMonitor } from '@/components/DeviceMonitor';
import { EventHistory } from '@/components/EventHistory';
import { SystemConfig } from '@/components/SystemConfig';
import { NetworkInfo } from '@/components/NetworkInfo';
import { Analytics } from '@/components/Analytics';

export const Dashboard: React.FC = () => {
  console.log('Dashboard component rendering...');
  
  try {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Dashboard ESP32 - Sistema de Controle Avançado
          </h1>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="config">Configuração</TabsTrigger>
              <TabsTrigger value="network">Rede</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Esp32Status />
                <DeviceMonitor />
                <NetworkInfo />
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <DeviceMonitor />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <EventHistory />
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <SystemConfig />
            </TabsContent>

            <TabsContent value="network" className="space-y-6">
              <NetworkInfo />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Analytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in Dashboard component:', error);
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Erro no Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ocorreu um erro ao carregar o dashboard. Verifique o console para mais detalhes.</p>
              <p className="text-red-500 mt-2">{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
};

export default Dashboard;
