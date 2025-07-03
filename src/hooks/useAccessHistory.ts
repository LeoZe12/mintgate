
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type AccessHistory = Tables<'access_history'>;
export type AccessHistoryInsert = TablesInsert<'access_history'>;

export const useAccessHistory = () => {
  const queryClient = useQueryClient();

  // Buscar histórico de acessos
  const { data: accessHistory, isLoading, error, refetch } = useQuery({
    queryKey: ['access-history'],
    queryFn: async (): Promise<AccessHistory[]> => {
      const { data, error } = await supabase
        .from('access_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        throw error;
      }

      return data || [];
    },
  });

  // Registrar tentativa de acesso
  const logAccessMutation = useMutation({
    mutationFn: async (accessData: AccessHistoryInsert): Promise<AccessHistory> => {
      const { data, error } = await supabase
        .from('access_history')
        .insert({
          ...accessData,
          plate: accessData.plate.toUpperCase(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar acesso:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-history'] });
    },
  });

  // Buscar histórico por apartamento
  const getHistoryByApartment = async (apartmentNumber: string): Promise<AccessHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('access_history')
        .select('*')
        .eq('apartment_number', apartmentNumber)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico por apartamento:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico por apartamento:', error);
      return [];
    }
  };

  return {
    accessHistory: accessHistory || [],
    isLoading,
    error,
    refetch,
    logAccess: logAccessMutation.mutateAsync,
    getHistoryByApartment,
    isLoggingAccess: logAccessMutation.isPending,
  };
};
