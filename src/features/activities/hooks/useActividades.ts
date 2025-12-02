import { useQuery } from '@tanstack/react-query';
import { actividadesService } from '../services/actividadesService';

export const useActividadesUsuario = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['actividades'],
    queryFn: () => actividadesService.getAll(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    actividades: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    loadActividades: refetch,
    // loadActividadById is not needed here as it should be a separate hook or query
    // clearActividadesError is handled by React Query state
  };
};

export const useActividadById = (id: string) => {
  return useQuery({
    queryKey: ['actividades', id],
    queryFn: () => actividadesService.getById(id),
    enabled: !!id,
  });
};
