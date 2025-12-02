import { useQuery } from '@tanstack/react-query';
import { actividadesClubService } from '../services/actividadesClubService';

export const useActividadesClub = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['actividades-club'],
    queryFn: () => actividadesClubService.getAll(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    actividades: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    loadActividades: refetch,
  };
};
