import { apiClient } from '../../../services/api';
import {
  Assignment,
  AssignmentsResponse,
  DailyTemplate,
  WeeklyScheduleResponse,
  ExercisesListResponse,
  WeekDay,
  MyTemplatesResponse,
  StudentTemplateDetailsResponse,
  RawAssignment,
  RawTemplate,
  RawExercise,
  StudentWeeklyScheduleResponse,
  RawDaySchedule,
  RawScheduledTemplate,
} from '../../../types/gym';
import {
  mapBackendToFrontendAssignment,
  mapBackendToFrontendTemplate,
  mapBackendToFrontendScheduledTemplate,
} from '../utils/mappers';
import {
  getTodayWeekday,
  getWeekdaySpanish,
  getDayShortName,
  formatDuration,
  formatRestTime,
  getDifficultyLabel,
  getMuscleGroupLabel,
} from '../utils/formatters';

// ============================================
// GYM SERVICE - API v2.0
// Updated: October 2025
// Based on official backend endpoints
// ============================================

class GymService {
  // ===== ASSIGNMENTS =====

  /**
   * Get current user's assigned templates (for students)
   * GET /api/student/my-templates
   * @returns Promise<Assignment[]>
   */
  async getMyTemplates(): Promise<Assignment[]> {
    try {
      const response = await apiClient.get<MyTemplatesResponse>(`/student/my-templates`);

      // Backend devuelve estructura: {data: {templates: [...], professor: {...}}}
      const templates = response?.data?.templates || response?.templates || [];

      // Mapear estructura del backend a nuestro tipo Assignment
      return templates.map(mapBackendToFrontendAssignment);
    } catch (error: any) {
      console.error('Failed to fetch my templates:', error);
      throw this.handleError(error, 'Failed to fetch templates');
    }
  }

  /**
   * Get student's assigned templates (for professors viewing student data)
   * GET /api/professor/students/{studentId}/assignments
   * @param studentId Student ID
   * @returns Promise<Assignment[]>
   */
  async getStudentAssignments(studentId: number): Promise<Assignment[]> {
    try {
      const response = await apiClient.get<AssignmentsResponse>(
        `/professor/students/${studentId}/assignments`
      );

      return response.assignments || [];
    } catch (error: any) {
      console.error('Failed to fetch student assignments:', error);
      throw this.handleError(error, 'Failed to fetch assignments');
    }
  }

  /**
   * Get template details (for students)
   * GET /api/student/template/{assignmentId}/details
   * @param assignmentId Assignment ID (not template ID)
   * @returns Promise<DailyTemplate>
   */
  async getTemplateDetails(assignmentId: number): Promise<DailyTemplate> {
    try {
      const response = await apiClient.get<StudentTemplateDetailsResponse>(`/student/template/${assignmentId}/details`);

      // Backend devuelve: {data: {template: {...}, exercises: [...], assignment_info: {...}}}
      const templateData = response?.data?.template || response?.template || ({} as RawTemplate);
      const exercises = response?.data?.exercises || response?.exercises || [];

      return mapBackendToFrontendTemplate(templateData, exercises, assignmentId);
    } catch (error: any) {
      console.error('Failed to fetch template details:', error);
      throw this.handleError(error, 'Failed to fetch template');
    }
  }

  /**
   * Get current user's weekly schedule (for students)
   * GET /api/student/my-weekly-calendar
   * @returns Promise<WeeklyScheduleResponse['schedule']>
   */
  async getWeeklySchedule(studentId?: number): Promise<WeeklyScheduleResponse['schedule']> {
    try {
      // Si se proporciona studentId, usar endpoint de profesor; sino, usar endpoint de estudiante
      const endpoint = studentId
        ? `/professor/students/${studentId}/weekly-schedule`
        : `/student/my-weekly-calendar`;

      const response = await apiClient.get<StudentWeeklyScheduleResponse>(endpoint);

      const scheduleData = response?.data?.days || response?.schedule || ({} as any);

      // Mapear días del backend a nuestro formato
      const schedule: WeeklyScheduleResponse['schedule'] = {};

      // Si scheduleData es un array de días
      if (Array.isArray(scheduleData)) {
        const dayMap: Record<string, WeekDay> = {
          Lunes: 'monday',
          Martes: 'tuesday',
          Miércoles: 'wednesday',
          Jueves: 'thursday',
          Viernes: 'friday',
          Sábado: 'saturday',
          Domingo: 'sunday',
        };

        scheduleData.forEach((dayInfo: RawDaySchedule) => {
          const dayNameStr = dayInfo.day_name || dayInfo.day;
          const dayName = dayNameStr ? (dayMap[dayNameStr] || dayNameStr.toLowerCase()) : undefined;

          // El backend devuelve 'assignments' no 'templates'
          const assignments = dayInfo.assignments || dayInfo.templates || [];
          if (dayName && assignments.length > 0) {
            schedule[dayName as WeekDay] = assignments.map(mapBackendToFrontendScheduledTemplate);
          }
        });
      } else {
        // Si scheduleData es un objeto con días como propiedades
        Object.keys(scheduleData).forEach((day) => {
          const templates = (scheduleData as any)[day];
          if (Array.isArray(templates)) {
            schedule[day as WeekDay] = templates.map(mapBackendToFrontendScheduledTemplate);
          }
        });
      }

      return schedule;
    } catch (error: any) {
      console.error('Failed to fetch weekly schedule:', error);
      throw this.handleError(error, 'Failed to fetch schedule');
    }
  }

  /**
   * Get exercises list with optional filters
   * GET /api/admin/gym/exercises
   * @param filters Optional filters
   * @returns Promise<ExerciseDetails[]>
   */
  async getExercises(filters?: {
    category?: 'strength' | 'cardio' | 'flexibility' | 'balance';
    muscle_group?: 'legs' | 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'full_body';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    search?: string;
    page?: number;
  }): Promise<ExercisesListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.category) params.append('category', filters.category);
      if (filters?.muscle_group) params.append('muscle_group', filters.muscle_group);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());

      const url = `/admin/gym/exercises${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<ExercisesListResponse>(url);

      return response;
    } catch (error: any) {
      console.error('Failed to fetch exercises:', error);
      throw this.handleError(error, 'Failed to fetch exercises');
    }
  }

  // ===== UTILITY METHODS =====

  getTodayWeekday(): WeekDay {
    return getTodayWeekday();
  }

  getWeekdaySpanish(day: WeekDay): string {
    return getWeekdaySpanish(day);
  }

  getDayShortName(day: WeekDay): string {
    return getDayShortName(day);
  }

  formatDuration(minutes: number): string {
    return formatDuration(minutes);
  }

  formatRestTime(seconds: number): string {
    return formatRestTime(seconds);
  }

  getDifficultyLabel(level: 'beginner' | 'intermediate' | 'advanced'): string {
    return getDifficultyLabel(level);
  }

  getMuscleGroupLabel(muscleGroup: string): string {
    return getMuscleGroupLabel(muscleGroup);
  }

  // ===== ERROR HANDLING =====

  /**
   * Handle API errors
   * @param error Error object
   * @param defaultMessage Default error message
   * @returns Error
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || defaultMessage;

      if (status === 401) {
        return new Error('Sesión expirada. Inicia sesión nuevamente');
      }
      if (status === 404) {
        return new Error('No se encontró la información solicitada');
      }
      if (status === 422) {
        return new Error(message || 'Datos inválidos');
      }
      if (status >= 500) {
        return new Error('Error del servidor. Intenta más tarde');
      }

      return new Error(message);
    }

    if (error.request) {
      return new Error('Sin conexión. Verifica tu internet');
    }

    return new Error(defaultMessage);
  }
}

// Export singleton instance
export const gymService = new GymService();
export default gymService;
