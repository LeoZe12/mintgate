
import React, { useState } from 'react';
import { CameraSetup } from './CameraSetup';
import { LivePlateRecognition } from './LivePlateRecognition';
import { IpCameraFeed } from './IpCameraFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CameraIntegration: React.FC = () => {
  const [cameraUrl, setCameraUrl] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);

  const handleCameraConfigured = (url: string) => {
    setCameraUrl(url);
    console.log('✅ Câmera configurada:', url);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return (
    <div className="space-y-6">
      {!cameraUrl ? (
        <CameraSetup 
          onCameraConfigured={handleCameraConfigured}
          currentUrl={cameraUrl}
        />
      ) : (
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live">Feed ao Vivo</TabsTrigger>
            <TabsTrigger value="recognition">Reconhecimento</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            <IpCameraFeed />
          </TabsContent>

          <TabsContent value="recognition" className="space-y-4">
            <LivePlateRecognition
              cameraUrl={cameraUrl}
              isActive={isMonitoring}
              onToggle={toggleMonitoring}
            />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <CameraSetup 
              onCameraConfigured={handleCameraConfigured}
              currentUrl={cameraUrl}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
