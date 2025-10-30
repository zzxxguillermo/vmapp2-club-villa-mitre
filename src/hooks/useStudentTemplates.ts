import { useState, useEffect } from 'react';
import { gymService } from '../services/gymService';
import { Assignment } from '../types/gym';

interface UseStudentTemplatesParams {
  studentId?: number; // Optional - if provided, fetches as professor; if not, fetches as student
  autoFetch?: boolean; // Default true
}

interface UseStudentTemplatesState {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch student assignments (templates)
 * @param studentId - Optional. If provided, fetches as professor viewing student's assignments. If not provided, fetches current user's assignments as student.
 * @param autoFetch - Whether to fetch automatically on mount (default: true)
 */
export const useStudentTemplates = (
  params?: UseStudentTemplatesParams
): UseStudentTemplatesState => {
  const { studentId, autoFetch = true } = params || {};
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If studentId is provided, use professor endpoint to view student's assignments
      // Otherwise, use student endpoint to view own assignments
      const response = studentId 
        ? await gymService.getStudentAssignments(studentId)
        : await gymService.getMyTemplates();
        
      setAssignments(response);
    } catch (err: any) {
      console.error('Failed to fetch student assignments:', err);
      setError(err.message || 'Error al cargar asignaciones');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchTemplates();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
  }, [studentId, autoFetch]);

  return {
    assignments,
    loading,
    error,
    refetch
  };
};

export default useStudentTemplates;
