
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { usePlateRecognition } from '@/hooks/usePlateRecognition';
import { useToast } from '@/hooks/use-toast';
import { cameraService } from '@/services/cameraService';

interface LivePlateRecognitionProps {
  cameraUrl: string;
  isActive: boolean;
  onToggle: () => void;
}

export const LivePlateRecognition: React.FC<LivePlateRecognitionProps> = ({
  cameraUrl,
  isActive,
  onToggle
}) => {
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { processPlateRecognition } = usePlateRecognition();
  const { toast } = useToast();

  useEffect(() => {
    if (isActive && cameraUrl) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => stopMonitoring();
  }, [isActive, cameraUrl]);

  const startMonitoring = () => {
    console.log('🎥 Iniciando monitoramento automático de placas...');
    
    // Capturar e processar a cada 5 segundos
    intervalRef.current = setInterval(async () => {
      if (!isProcessing) {
        await captureAndProcess();
      }
    }, 5000);
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const captureAndProcess = async () => {
    try {
      setIsProcessing(true);
      
      // Capturar imagem da câmera
      const imageBlob = await captureFromCamera();
      if (!imageBlob) return;

      // Converter para File
      const imageFile = new File([imageBlob], `capture_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      setLastCapture(URL.createObjectURL(imageBlob));

      // Processar reconhecimento
      const result = await processPlateRecognition(imageFile);
      setLastResult(result);

      if (result.accessGranted) {
        toast({
          title: "Acesso Autorizado!",
          description: `Placa ${result.plateNumber} - ${result.reason}`,
        });
      } else if (result.plateNumber) {
        toast({
          title: "Acesso Negado",
          description: `Placa ${result.plateNumber} - ${result.reason}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erro no processamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const captureFromCamera = async (): Promise<Blob | null> => {
    try {
      // Usar o serviço de câmera para capturar imagem
      const imageBlob = await cameraService.captureImage(cameraUrl);
      return imageBlob;
    } catch (error) {
      console.error('Erro ao capturar da câmera:', error);
      return null;
    }
  };

  const getStatusBadge = () => {
    if (!isActive) {
      return <Badge variant="outline">Inativo</Badge>;
    }
    
    if (isProcessing) {
      return (
        <Badge variant="secondary">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Processando
        </Badge>
      );
    }
    
    return <Badge variant="default">Monitorando</Badge>;
  };

  const getLastResultBadge = () => {
    if (!lastResult) return null;
    
    if (lastResult.accessGranted) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Autorizado
        </Badge>
      );
    } else if (lastResult.plateNumber) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Negado
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Reconhecimento Automático
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {getLastResultBadge()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Monitoramento automático de placas a cada 5 segundos
          </p>
          <Button
            onClick={onToggle}
            variant={isActive ? "destructive" : "default"}
            size="sm"
          >
            {isActive ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Parar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
        </div>

        {lastCapture && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Última Captura:</h4>
            <div className="relative">
              <img
                src={lastCapture}
                alt="Última captura"
                className="w-full max-h-48 object-contain rounded border"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {lastResult && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Último Resultado:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Placa: <strong>{lastResult.plateNumber || 'Não detectada'}</strong></div>
              <div>Confiança: <strong>{(lastResult.confidence * 100).toFixed(1)}%</strong></div>
              <div>Status: <strong>{lastResult.accessGranted ? 'Autorizado' : 'Negado'}</strong></div>
              <div>Portão: <strong>{lastResult.accessGranted ? 'Aberto' : 'Fechado'}</strong></div>
            </div>
            <p className="text-xs text-muted-foreground">{lastResult.reason}</p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};
