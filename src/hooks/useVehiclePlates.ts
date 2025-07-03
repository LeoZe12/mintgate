
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type VehiclePlate = Tables<'vehicle_plates'>;
export type VehiclePlateInsert = TablesInsert<'vehicle_plates'>;
export type VehiclePlateUpdate = TablesUpdate<'vehicle_plates'>;

export const useVehiclePlates = () => {
  const queryClient = useQueryClient();

  // Buscar todas as placas cadastradas
  const { data: plates, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicle-plates'],
    queryFn: async (): Promise<VehiclePlate[]> => {
      const { data, error } = await supabase
        .from('vehicle_plates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar placas:', error);
        throw error;
      }

      return data || [];
    },
  });

  // Buscar placa específica
  const findPlateByNumber = async (plateNumber: string): Promise<VehiclePlate | null> => {
    try {
      const { data, error } = await supabase
        .from('vehicle_plates')
        .select('*')
        .eq('plate', plateNumber.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar placa:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar placa:', error);
      return null;
    }
  };

  // Adicionar nova placa
  const addPlateMutation = useMutation({
    mutationFn: async (newPlate: VehiclePlateInsert): Promise<VehiclePlate> => {
      const { data, error } = await supabase
        .from('vehicle_plates')
        .insert({
          ...newPlate,
          plate: newPlate.plate.toUpperCase(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar placa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-plates'] });
    },
  });

  // Atualizar placa
  const updatePlateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VehiclePlateUpdate }): Promise<VehiclePlate> => {
      const { data, error } = await supabase
        .from('vehicle_plates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar placa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-plates'] });
    },
  });

  // Remover placa (soft delete)
  const removePlateMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('vehicle_plates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover placa:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-plates'] });
    },
  });

  return {
    plates: plates || [],
    isLoading,
    error,
    refetch,
    findPlateByNumber,
    addPlate: addPlateMutation.mutateAsync,
    updatePlate: updatePlateMutation.mutateAsync,
    removePlate: removePlateMutation.mutateAsync,
    isAddingPlate: addPlateMutation.isPending,
    isUpdatingPlate: updatePlateMutation.isPending,
    isRemovingPlate: removePlateMutation.isPending,
  };
};
