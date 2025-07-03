
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface VehiclePlate {
  id: string;
  plate: string;
  apartment_number: string;
  owner_name?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehiclePlateInsert {
  plate: string;
  apartment_number: string;
  owner_name?: string;
  vehicle_model?: string;
  vehicle_color?: string;
}

export const useVehiclePlates = () => {
  const [plates, setPlates] = useLocalStorage<VehiclePlate[]>('vehicle_plates', []);
  const [isLoading, setIsLoading] = useState(false);

  // Função para salvar dados em arquivo .txt
  const saveToTextFile = useCallback((data: VehiclePlate[], filename: string = 'placas_veiculos.txt') => {
    const content = data.map(plate => 
      `ID: ${plate.id}\n` +
      `Placa: ${plate.plate}\n` +
      `Apartamento: ${plate.apartment_number}\n` +
      `Proprietário: ${plate.owner_name || 'N/A'}\n` +
      `Modelo: ${plate.vehicle_model || 'N/A'}\n` +
      `Cor: ${plate.vehicle_color || 'N/A'}\n` +
      `Ativo: ${plate.is_active ? 'Sim' : 'Não'}\n` +
      `Criado em: ${plate.created_at}\n` +
      `Atualizado em: ${plate.updated_at}\n` +
      `${'='.repeat(50)}\n`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const findPlateByNumber = useCallback(async (plateNumber: string): Promise<VehiclePlate | null> => {
    const foundPlate = plates.find(
      plate => plate.plate.toUpperCase() === plateNumber.toUpperCase() && plate.is_active
    );
    return foundPlate || null;
  }, [plates]);

  const addPlate = useCallback(async (newPlate: VehiclePlateInsert): Promise<VehiclePlate> => {
    setIsLoading(true);
    try {
      const plate: VehiclePlate = {
        id: Date.now().toString(),
        ...newPlate,
        plate: newPlate.plate.toUpperCase(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedPlates = [...plates, plate];
      setPlates(updatedPlates);
      saveToTextFile(updatedPlates);
      
      return plate;
    } finally {
      setIsLoading(false);
    }
  }, [plates, setPlates, saveToTextFile]);

  const updatePlate = useCallback(async ({ id, updates }: { id: string; updates: Partial<VehiclePlate> }): Promise<VehiclePlate> => {
    setIsLoading(true);
    try {
      const updatedPlates = plates.map(plate => 
        plate.id === id 
          ? { ...plate, ...updates, updated_at: new Date().toISOString() }
          : plate
      );
      
      setPlates(updatedPlates);
      saveToTextFile(updatedPlates);
      
      const updatedPlate = updatedPlates.find(p => p.id === id)!;
      return updatedPlate;
    } finally {
      setIsLoading(false);
    }
  }, [plates, setPlates, saveToTextFile]);

  const removePlate = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const updatedPlates = plates.map(plate => 
        plate.id === id 
          ? { ...plate, is_active: false, updated_at: new Date().toISOString() }
          : plate
      );
      
      setPlates(updatedPlates);
      saveToTextFile(updatedPlates);
    } finally {
      setIsLoading(false);
    }
  }, [plates, setPlates, saveToTextFile]);

  const refetch = useCallback(async () => {
    // Em um sistema local, não há necessidade de refetch
    return Promise.resolve();
  }, []);

  return {
    plates: plates.filter(plate => plate.is_active),
    isLoading,
    error: null,
    refetch,
    findPlateByNumber,
    addPlate,
    updatePlate,
    removePlate,
    isAddingPlate: isLoading,
    isUpdatingPlate: isLoading,
    isRemovingPlate: isLoading,
    saveToTextFile: () => saveToTextFile(plates),
  };
};
