
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TestTube, Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { usePlateRecognizer } from '@/hooks/usePlateRecognizer';
import { useToast } from '@/hooks/use-toast';

export const PlateRecognizerTest: React.FC = () => {
  const { toast } = useToast();
  const { recognizePlate, testConnection, isOfflineMode, currentEndpoint } = usePlateRecognizer();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRecognitionResult(null);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected);
      toast({
        title: isConnected ? "Conexão OK" : "Conexão Falhou",
        description: isConnected 
          ? "Conexão com o Plate Recognizer estabelecida com sucesso!"
          : "Não foi possível conectar ao Plate Recognizer. Verifique as configurações.",
        variant: isConnected ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus(false);
      toast({
        title: "Erro de Conexão",
        description: "Erro ao testar conexão: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRecognizePlate = async () => {
    if (!selectedFile) {
      toast({
        title: "Arquivo Necessário",
        description: "Por favor, selecione uma imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsRecognizing(true);
    try {
      const result = await recognizePlate(selectedFile);
      setRecognitionResult(result);
      toast({
        title: "Reconhecimento Concluído",
        description: `Encontradas ${result.results.length} placas na imagem.`,
      });
    } catch (error) {
      toast({
        title: "Erro no Reconhecimento",
        description: "Erro ao reconhecer placa: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Teste do Plate Recognizer SDK
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status do modo */}
          <div className="flex items-center gap-2">
            <Label>Modo Atual:</Label>
            <Badge variant={isOfflineMode ? "secondary" : "default"}>
              {isOfflineMode ? "SDK Offline" : "API Online"}
            </Badge>
          </div>

          {/* Endpoint atual */}
          <div className="space-y-2">
            <Label>Endpoint:</Label>
            <Input value={currentEndpoint} readOnly className="bg-gray-50" />
          </div>

          {/* Teste de conexão */}
          <div className="space-y-2">
            <Button 
              onClick={handleTestConnection} 
              disabled={isTestingConnection}
              variant="outline"
              className="w-full"
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : connectionStatus === true ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : connectionStatus === false ? (
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              {isTestingConnection ? "Testando..." : "Testar Conexão"}
            </Button>
            
            {connectionStatus !== null && (
              <Badge variant={connectionStatus ? "default" : "destructive"}>
                {connectionStatus ? "Conexão OK" : "Conexão Falhou"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Teste de Reconhecimento de Placa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Selecionar Imagem:</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Botão de reconhecimento */}
          <Button 
            onClick={handleRecognizePlate}
            disabled={!selectedFile || isRecognizing}
            className="w-full"
          >
            {isRecognizing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isRecognizing ? "Reconhecendo..." : "Reconhecer Placa"}
          </Button>

          {/* Resultado */}
          {recognitionResult && (
            <div className="space-y-2">
              <Label>Resultado:</Label>
              <Textarea
                value={JSON.stringify(recognitionResult, null, 2)}
                readOnly
                className="h-40 font-mono text-sm"
              />
              
              {recognitionResult.results.length > 0 && (
                <div className="space-y-2">
                  <Label>Placas Encontradas:</Label>
                  {recognitionResult.results.map((result: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="default">{result.plate}</Badge>
                      <Badge variant="outline">
                        {(result.confidence * 100).toFixed(1)}% confiança
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
