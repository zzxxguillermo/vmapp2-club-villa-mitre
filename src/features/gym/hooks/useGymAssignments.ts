import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../auth/hooks/useAuth';
import { gymService } from '../services/gymService';
import { TemplateWithDetails } from '../../../types/gym';

export const useGymAssignments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchGymData = async () => {
    if (!user) return { assignments: [], weeklySchedule: null };

    // 1. Cargar rutinas asignadas
    const userAssignments = await gymService.getMyTemplates();
    const activeAssignments = userAssignments.filter((a) => a.is_active);

    // 2. Cargar calendario semanal en paralelo (fail-safe)
    const schedulePromise = gymService.getWeeklySchedule().catch((err) => {
      console.log('⚠️ Error al cargar calendario, continuando sin él:', err);
      return null;
    });

    // 3. Cargar detalles de cada rutina en paralelo
    const detailsPromises = activeAssignments.map(async (assignment) => {
      try {
        const details = await gymService.getTemplateDetails(assignment.id);
        return { ...assignment, detailsLoaded: true, fullTemplate: details };
      } catch (error) {
        console.log(`⚠️ Error al cargar detalles de rutina ${assignment.id}:`, error);
        return { ...assignment, detailsLoaded: false };
      }
    });

    // Esperar a que todas las peticiones terminen
    const [schedule, ...assignmentsWithDetails] = await Promise.all([
      schedulePromise,
      ...detailsPromises,
    ]);

    return {
      assignments: assignmentsWithDetails as TemplateWithDetails[],
      weeklySchedule: schedule,
    };
  };

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['gym', 'data', user?.id],
    queryFn: fetchGymData,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Auto-refresh logic handled by React Query's staleTime and refetchOnWindowFocus
  // But we can keep the manual refresh logic if needed

  const refreshData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Refetch on focus if stale (optional, React Query does this by default if configured)
  useFocusEffect(
    useCallback(() => {
      // Optional: Force refetch if needed, or rely on staleTime
      // queryClient.invalidateQueries({ queryKey: ['gym', 'data'] });
    }, [])
  );

  return {
    assignments: data?.assignments || [],
    weeklySchedule: data?.weeklySchedule || null,
    loading: isLoading,
    loadingDetails: isLoading, // Combined loading
    isAutoRefreshing: isRefetching,
    refreshData,
  };
};
