
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemStatus } from '@/components/SystemStatus';
import { EventHistory } from '@/components/EventHistory';
import { SystemConfig } from '@/components/SystemConfig';
import { Analytics } from '@/components/Analytics';
import { CameraIntegration } from '@/components/CameraIntegration';
import { IpCameraFeed } from '@/components/IpCameraFeed';
import { OfflineStatus } from '@/components/OfflineStatus';

export const Dashboard: React.FC = () => {
  console.log('Dashboard component rendering...');
  
  try {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Dashboard ESP32 - Sistema de Controle Avançado
          </h1>
          
          <OfflineStatus />
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="camera">Câmera</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="config">Configuração</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemStatus />
                <IpCameraFeed />
              </div>
            </TabsContent>

            <TabsContent value="camera" className="space-y-6">
              <CameraIntegration />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <EventHistory />
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <SystemConfig />
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
