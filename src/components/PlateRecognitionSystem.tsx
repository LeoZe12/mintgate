
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Upload, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { usePlateRecognition, type PlateRecognitionResult } from '@/hooks/usePlateRecognition';
import { useToast } from '@/hooks/use-toast';

export const PlateRecognitionSystem = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<PlateRecognitionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processPlateRecognition } = usePlateRecognition();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRecognitionResult(null);
      
      // Criar preview da imagem
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await processPlateRecognition(selectedFile);
      setRecognitionResult(result);
      
      if (result.accessGranted) {
        toast({
          title: "Acesso Autorizado",
          description: `Portão aberto para apartamento ${result.apartmentNumber}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Acesso Negado",
          description: result.reason,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSystem = () => {
    setSelectedFile(null);
    setRecognitionResult(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const getStatusIcon = (result: PlateRecognitionResult) => {
    if (result.accessGranted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (result: PlateRecognitionResult) => {
    if (result.accessGranted) {
      return <Badge variant="default" className="bg-green-500">Autorizado</Badge>;
    } else {
      return <Badge variant="destructive">Negado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Sistema de Reconhecimento de Placas
          </CardTitle>
          <CardDescription>
            Faça upload de uma imagem para reconhecer e validar placas de veículos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de Imagem */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Imagem
            </Button>

            {previewUrl && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Preview da imagem:</p>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full h-64 object-contain border rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Botão de Processar */}
          {selectedFile && (
            <Button
              onClick={handleProcessImage}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Reconhecer Placa
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Resultado do Reconhecimento */}
      {recognitionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(recognitionResult)}
              Resultado do Reconhecimento
              {getStatusBadge(recognitionResult)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Placa Detectada</p>
                <p className="text-lg font-mono">
                  {recognitionResult.plateNumber || 'Não detectada'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confiança</p>
                <p className="text-lg">
                  {(recognitionResult.confidence * 100).toFixed(1)}%
                </p>
              </div>

              {recognitionResult.apartmentNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Apartamento</p>
                  <p className="text-lg">{recognitionResult.apartmentNumber}</p>
                </div>
              )}

              {recognitionResult.ownerName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proprietário</p>
                  <p className="text-lg">{recognitionResult.ownerName}</p>
                </div>
              )}

              {recognitionResult.vehicleInfo && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Veículo</p>
                  <p className="text-lg">{recognitionResult.vehicleInfo}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="flex items-start gap-2">
                {recognitionResult.accessGranted ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <p className="text-sm">{recognitionResult.reason}</p>
              </div>
            </div>

            <Button onClick={resetSystem} variant="outline" className="w-full mt-4">
              Processar Nova Imagem
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
