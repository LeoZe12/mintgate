
import { useCallback } from 'react';
import { usePlateRecognizer } from './usePlateRecognizer';
import { useVehiclePlates } from './useVehiclePlates';
import { useAccessHistory } from './useAccessHistory';
import { useEsp32Status } from './useEsp32Status';

export interface PlateRecognitionResult {
  plateNumber: string;
  confidence: number;
  isAuthorized: boolean;
  apartmentNumber?: string;
  ownerName?: string;
  vehicleInfo?: string;
  accessGranted: boolean;
  reason: string;
}

export const usePlateRecognition = () => {
  const { recognizePlate } = usePlateRecognizer();
  const { findPlateByNumber } = useVehiclePlates();
  const { logAccess } = useAccessHistory();
  const { openGate } = useEsp32Status();

  const processPlateRecognition = useCallback(async (
    imageFile: File
  ): Promise<PlateRecognitionResult> => {
    try {
      console.log('🔍 Iniciando reconhecimento de placa...');
      
      // 1. Reconhecer placa na imagem usando SDK Offline
      const recognitionResult = await recognizePlate(imageFile);
      
      if (!recognitionResult.plate) {
        const result: PlateRecognitionResult = {
          plateNumber: '',
          confidence: 0,
          isAuthorized: false,
          accessGranted: false,
          reason: 'Nenhuma placa detectada na imagem'
        };

        await logAccess({
          plate: 'UNKNOWN',
          access_granted: false,
          confidence_score: 0,
          reason: result.reason,
        });

        return result;
      }

      const plateNumber = recognitionResult.plate.toUpperCase();
      const confidence = recognitionResult.confidence;

      console.log('📋 Placa detectada:', plateNumber, 'Confiança:', confidence);

      // 2. Verificar se a placa está cadastrada
      const registeredPlate = await findPlateByNumber(plateNumber);
      
      let result: PlateRecognitionResult;
      
      if (registeredPlate) {
        // Placa autorizada
        result = {
          plateNumber,
          confidence,
          isAuthorized: true,
          apartmentNumber: registeredPlate.apartment_number,
          ownerName: registeredPlate.owner_name || undefined,
          vehicleInfo: registeredPlate.vehicle_model && registeredPlate.vehicle_color 
            ? `${registeredPlate.vehicle_color} ${registeredPlate.vehicle_model}`
            : undefined,
          accessGranted: true,
          reason: `Acesso autorizado para apartamento ${registeredPlate.apartment_number}`
        };

        console.log('✅ Acesso autorizado para:', result.apartmentNumber);

        // 3. Abrir portão
        try {
          await openGate();
          console.log('🚪 Portão aberto com sucesso');
        } catch (error) {
          console.error('❌ Erro ao abrir portão:', error);
          result.reason += ' (Erro ao abrir portão)';
        }

        // 4. Registrar acesso autorizado
        await logAccess({
          plate: plateNumber,
          apartment_number: registeredPlate.apartment_number,
          access_granted: true,
          confidence_score: confidence,
          reason: result.reason,
        });

      } else {
        // Placa não autorizada
        result = {
          plateNumber,
          confidence,
          isAuthorized: false,
          accessGranted: false,
          reason: 'Placa não cadastrada no sistema'
        };

        console.log('❌ Acesso negado - Placa não cadastrada:', plateNumber);

        // Registrar tentativa de acesso negada
        await logAccess({
          plate: plateNumber,
          access_granted: false,
          confidence_score: confidence,
          reason: result.reason,
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Erro no processamento de reconhecimento:', error);
      
      const result: PlateRecognitionResult = {
        plateNumber: '',
        confidence: 0,
        isAuthorized: false,
        accessGranted: false,
        reason: `Erro no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };

      try {
        await logAccess({
          plate: 'ERROR',
          access_granted: false,
          confidence_score: 0,
          reason: result.reason,
        });
      } catch (logError) {
        console.error('Erro ao registrar log de erro:', logError);
      }

      return result;
    }
  }, [recognizePlate, findPlateByNumber, logAccess, openGate]);

  return {
    processPlateRecognition,
  };
};
