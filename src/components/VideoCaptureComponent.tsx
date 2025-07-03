
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Square, Play, Pause } from 'lucide-react';
import { videoCaptureService } from '@/services/videoCapture';
import { enhancedPlateRecognizerService } from '@/services/enhancedPlateRecognizerService';
import { useToast } from '@/hooks/use-toast';

export const VideoCaptureComponent: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<File[]>([]);
  const [batchSize, setBatchSize] = useState(5);
  const [captureInterval, setCaptureInterval] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleInitialize = async () => {
    try {
      await videoCaptureService.initialize({
        width: 640,
        height: 480,
        facingMode: 'environment',
      });
      
      const videoElement = videoCaptureService.getVideoElement();
      if (videoElement && videoRef.current) {
        videoRef.current.srcObject = videoElement.srcObject;
        videoRef.current.play();
      }
      
      setIsInitialized(true);
      toast({
        title: "Câmera Inicializada",
        description: "Câmera pronta para captura de frames",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível inicializar a câmera: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleCaptureFrame = () => {
    const frame = videoCaptureService.captureFrame();
    if (frame) {
      setCapturedFrames(prev => [...prev, frame]);
      toast({
        title: "Frame Capturado",
        description: `Frame ${capturedFrames.length + 1} capturado com sucesso`,
      });
    }
  };

  const handleBatchCapture = async () => {
    setIsCapturing(true);
    try {
      const frames = await videoCaptureService.captureBatch(batchSize, captureInterval);
      setCapturedFrames(prev => [...prev, ...frames]);
      toast({
        title: "Lote Capturado",
        description: `${frames.length} frames capturados com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao capturar lote: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleProcessFrames = async () => {
    if (capturedFrames.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum frame capturado para processar",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await enhancedPlateRecognizerService.processBulk(capturedFrames);
      toast({
        title: "Processamento Concluído",
        description: `${result.successful} de ${result.totalProcessed} frames processados com sucesso`,
      });
      
      console.log('Resultado do processamento em lote:', result);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar frames: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFrames = () => {
    setCapturedFrames([]);
    toast({
      title: "Frames Limpos",
      description: "Todos os frames capturados foram removidos",
    });
  };

  const handleStop = async () => {
    await videoCaptureService.stop();
    setIsInitialized(false);
    setIsCapturing(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      videoCaptureService.stop();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Captura de Vídeo em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isInitialized ? (
          <Button onClick={handleInitialize} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Inicializar Câmera
          </Button>
        ) : (
          <>
            <div className="space-y-2">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto border rounded-lg"
                autoPlay
                muted
                playsInline
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch-size">Tamanho do Lote</Label>
                <Input
                  id="batch-size"
                  type="number"
                  min="1"
                  max="20"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo (ms)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="100"
                  max="5000"
                  value={captureInterval}
                  onChange={(e) => setCaptureInterval(parseInt(e.target.value) || 1000)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCaptureFrame} variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Capturar Frame
              </Button>
              
              <Button 
                onClick={handleBatchCapture} 
                disabled={isCapturing}
                variant="outline"
              >
                {isCapturing ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isCapturing ? 'Capturando...' : 'Capturar Lote'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {capturedFrames.length} frames capturados
              </Badge>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleProcessFrames}
                  disabled={capturedFrames.length === 0 || isProcessing}
                  size="sm"
                >
                  {isProcessing ? 'Processando...' : 'Processar Frames'}
                </Button>
                
                <Button 
                  onClick={handleClearFrames}
                  disabled={capturedFrames.length === 0}
                  variant="outline"
                  size="sm"
                >
                  Limpar
                </Button>
              </div>
            </div>

            <Button onClick={handleStop} variant="destructive" className="w-full">
              <Square className="h-4 w-4 mr-2" />
              Parar Câmera
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
