import { apiClient } from './api';
import { 
  Assignment,
  AssignmentsResponse,
  DailyTemplate,
  TemplateDetailsResponse,
  WeeklyScheduleResponse,
  ScheduledTemplate,
  ExercisesListResponse,
  ExerciseDetails,
  WeekDay
} from '../types/gym';

// ============================================
// GYM SERVICE - API v2.0
// Updated: October 2025
// Based on official backend endpoints
// ============================================

class GymService {
  private readonly API_BASE = '/api';
  
  // ===== STUDENT ENDPOINTS =====
  /**
   * Get the weekly plan for the authenticated user (LEGACY - use getMyWeeklyCalendar)
   * @deprecated Use getMyWeeklyCalendar instead
   * @param date Optional date in YYYY-MM-DD format. If omitted, uses current date
   * @returns Promise<WeeklyPlan>
   */
  async getMyWeek(date?: string): Promise<WeeklyPlan> {
    try {
      const url = date ? `/gym/my-week?date=${date}` : '/gym/my-week';
      const response = await apiClient.get<ApiWeeklyPlanResponse>(url);
      
      // Legacy endpoint - map to new structure
      return {
        week_start: response.week_start || '',
        week_end: response.week_end || '',
        days: response.days.map((day: any) => ({
          date: day.date,
          day_name: '', // Legacy doesn't have this
          day_short: '', // Legacy doesn't have this
          day_number: day.weekday || 0,
          has_workouts: day.has_session || false,
          assignments: [] // Legacy doesn't have assignments
        }))
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch weekly plan');
    }
  }

  /**
   * Get the daily workout for the authenticated user (LEGACY - use getTemplateDetails)
   * @deprecated Use getTemplateDetails instead
   * @param date Optional date in YYYY-MM-DD format. If omitted, uses current date
   * @returns Promise<DailyWorkout>
   */
  async getMyDay(date?: string): Promise<DailyWorkout> {
    try {
      const url = date ? `/gym/my-day?date=${date}` : '/gym/my-day';
      const response = await apiClient.get<ApiDailyWorkoutResponse>(url);
      
      return {
        title: response.title,
        exercises: response.exercises.map((exercise: any, index: number) => ({
          id: exercise.id || index, // Legacy might not have ID
          name: exercise.name,
          order: exercise.order,
          sets: exercise.sets.map((set: any, setIndex: number) => ({
            id: set.id || setIndex,
            set_number: setIndex + 1,
            reps: set.reps,
            rest_seconds: set.rest_seconds,
            tempo: set.tempo,
            rpe_target: set.rpe_target,
            notes: set.notes
          })),
          notes: exercise.notes
        }))
      };
    } catch (error: any) {
      // Handle 404 as "no workout for today"
      if (error.response?.status === 404) {
        return {
          title: null,
          exercises: []
        };
      }
      throw this.handleError(error, 'Failed to fetch daily workout');
    }
  }

  /**
   * Get today's workout (convenience method)
   * @returns Promise<DailyWorkout>
   */
  async getTodayWorkout(): Promise<DailyWorkout> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.getMyDay(today);
  }

  /**
   * Check if user has a workout today
   * @returns Promise<boolean>
   */
  async hasWorkoutToday(): Promise<boolean> {
    try {
      const todayWorkout = await this.getTodayWorkout();
      return todayWorkout.title !== null && todayWorkout.exercises.length > 0;
    } catch (error) {
      console.warn('Failed to check today workout:', error);
      return false;
    }
  }

  /**
   * Get workout summary for today (for Home screen card)
   * @returns Promise<WorkoutSummary>
   */
  async getTodayWorkoutSummary(): Promise<import('../types/gym').WorkoutSummary> {
    try {
      // Try new student endpoints first
      const todayTemplate = await this.getTodayTemplate();
      
      if (!todayTemplate) {
        return {
          status: 'rest_day',
          hasWorkout: false,
          title: null,
          exerciseCount: 0,
          message: 'Día de descanso',
          canRetry: false
        };
      }
      
      return {
        status: 'workout_available',
        hasWorkout: true,
        title: todayTemplate.daily_template.title,
        exerciseCount: todayTemplate.daily_template.exercises_count,
        message: `${todayTemplate.daily_template.exercises_count} ejercicio${todayTemplate.daily_template.exercises_count !== 1 ? 's' : ''} • ${todayTemplate.daily_template.estimated_duration_min} min`,
        canRetry: false
      };
    } catch (error: any) {
      console.warn('Failed to get today workout summary (new endpoints), trying legacy:', error);
      
      // Fallback to legacy endpoints for backward compatibility
      try {
        const todayWorkout = await this.getTodayWorkout();
        
        if (todayWorkout.title === null || todayWorkout.exercises.length === 0) {
          return {
            status: 'no_assignment',
            hasWorkout: false,
            title: null,
            exerciseCount: 0,
            message: 'No tienes rutina asignada para hoy',
            canRetry: true
          };
        }
        
        return {
          status: 'workout_available',
          hasWorkout: true,
          title: todayWorkout.title,
          exerciseCount: todayWorkout.exercises.length,
          message: `${todayWorkout.exercises.length} ejercicio${todayWorkout.exercises.length !== 1 ? 's' : ''}`,
          canRetry: false
        };
      } catch (legacyError: any) {
        console.warn('Failed to get today workout summary (legacy):', legacyError);
        
        // Determine error type for better UX
        if (error.response?.status === 401 || legacyError.response?.status === 401) {
          return {
            status: 'error',
            hasWorkout: false,
            title: null,
            exerciseCount: 0,
            message: 'Sesión expirada. Inicia sesión nuevamente',
            canRetry: false
          };
        }
        
        if (error.message?.includes('Network request failed') || legacyError.message?.includes('Network request failed')) {
          return {
            status: 'network_error',
            hasWorkout: false,
            title: null,
            exerciseCount: 0,
            message: 'Sin conexión. Verifica tu internet',
            canRetry: true
          };
        }
        
        return {
          status: 'error',
          hasWorkout: false,
          title: null,
          exerciseCount: 0,
          message: 'Error al cargar rutina',
          canRetry: true
        };
      }
    }
  }

  /**
   * Format rest time in human readable format
   * @param seconds Rest time in seconds
   * @returns Formatted string (e.g., "2 min", "90 seg")
   */
  formatRestTime(seconds: number): string {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes} min`;
      }
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} min`;
    }
    return `${seconds} seg`;
  }

  /**
   * Format RPE for display
   * @param rpe RPE value (1-10)
   * @returns Formatted string (e.g., "RPE 8/10")
   */
  formatRPE(rpe?: number): string | null {
    if (!rpe) return null;
    return `RPE ${rpe}/10`;
  }

  /**
   * Get weekday name in Spanish
   * @param weekday Weekday number (1=Monday, 7=Sunday)
   * @returns Spanish weekday name
   */
  getWeekdayName(weekday: number): string {
    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[weekday] || '';
  }

  /**
   * Get weekday short name in Spanish
   * @param weekday Weekday number (1=Monday, 7=Sunday)
   * @returns Spanish weekday short name
   */
  getWeekdayShort(weekday: number): string {
    const days = ['', 'L', 'M', 'X', 'J', 'V', 'S', 'D'];
    return days[weekday] || '';
  }

  // ===== NEW STUDENT ENDPOINTS =====

  /**
   * Get student's assigned templates from professor (API v2.0)
   * @returns Promise<StudentTemplatesResponse>
   */
  async getMyTemplates(): Promise<StudentTemplatesResponse> {
    try {
      const response = await apiClient.get<{message: string, data: any}>('/student/my-templates');
      
      // Extract data from the response structure: {message, data: {professor, templates}}
      const { data } = response;
      
      return {
        professor: {
          id: data.professor?.id || 0,
          name: data.professor?.name || 'Profesor',
          email: data.professor?.email || ''
        },
        templates: data.templates?.map((template: any) => ({
          id: template.id,
          daily_template: {
            id: template.daily_template?.id || 0,
            title: template.daily_template?.title || 'Entrenamiento',
            goal: template.daily_template?.goal || 'strength',
            level: template.daily_template?.level || 'beginner',
            estimated_duration_min: template.daily_template?.estimated_duration_min || 30,
            tags: template.daily_template?.tags || [],
            exercises_count: template.daily_template?.exercises_count || 0,
            created_at: template.daily_template?.created_at
          },
          start_date: template.start_date,
          end_date: template.end_date || null,
          frequency: template.frequency || [],
          frequency_days: template.frequency_days || [],
          professor_notes: template.professor_notes || '',
          status: template.status || 'active',
          assigned_by: {
            id: template.assigned_by?.id || 0,
            name: template.assigned_by?.name || 'Profesor',
            email: template.assigned_by?.email
          },
          created_at: template.created_at
        })) || []
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch student templates');
    }
  }

  /**
   * Get detailed information about a specific template
   * @param templateId Template ID to get details for
   * @returns Promise<DailyWorkout>
   */
  async getTemplateDetails(templateId: number): Promise<DailyWorkout> {
    try {
      const response = await apiClient.get<{message: string, data: any}>(`/student/template/${templateId}/details`);
      
      // Extract data from the response structure: {message, data: {assignment_info, template, exercises}}
      const { data } = response;
      const { template, exercises, assignment_info } = data;
      
      // Debug log to see exercise structure
      if (__DEV__ && exercises.length > 0) {
        console.log('🏋️ Exercise structure from backend:', JSON.stringify(exercises[0], null, 2));
      }
      
      return {
        title: template.title,
        exercises: exercises.map((exerciseWrapper: any, index: number) => {
          // Nueva estructura: {id, order, exercise: {...}, sets: [...], notes}
          const exercise = exerciseWrapper.exercise;
          const sets = exerciseWrapper.sets || [];
          
          // Handle target_muscle_groups (array) or legacy muscle_group (string)
          let muscleGroup = 'General';
          if (exercise.target_muscle_groups && Array.isArray(exercise.target_muscle_groups)) {
            muscleGroup = exercise.target_muscle_groups.join(', ');
          } else if (exercise.target_muscle_groups) {
            muscleGroup = exercise.target_muscle_groups;
          } else if (exercise.muscle_group || exercise.muscleGroup) {
            muscleGroup = exercise.muscle_group || exercise.muscleGroup;
          }
          
          return {
            id: exerciseWrapper.id || exercise.id || index,
            name: exercise.name || `Ejercicio ${index + 1}`,
            order: exerciseWrapper.order || index + 1,
            target_muscle_groups: exercise.target_muscle_groups && Array.isArray(exercise.target_muscle_groups) 
              ? exercise.target_muscle_groups 
              : undefined,
            muscle_group: muscleGroup, // Legacy support
            equipment: exercise.equipment === null ? 'Ninguno' : (exercise.equipment || 'Peso corporal'),
            difficulty: exercise.difficulty_level || 'intermediate',
            description: exercise.description || null,
            instructions: exercise.instructions || null,
            notes: exerciseWrapper.notes || null, // Notas del ejercicio en la plantilla
            sets: sets.map((set: any, setIndex: number) => ({
              id: set.id || setIndex,
              set_number: set.set_number || setIndex + 1,
              reps_min: set.reps_min,
              reps_max: set.reps_max,
              reps: set.reps === null ? 'A determinar' : (set.reps || `${set.reps_min || 8}-${set.reps_max || 12}`),
              rpe_target: set.rpe_target || null,
              rest_seconds: set.rest_seconds || 60,
              tempo: set.tempo || '',
              weight: set.weight, // LEGACY
              weight_min: set.weight_min || null,
              weight_max: set.weight_max || null,
              weight_target: set.weight_target || null,
              duration: set.duration,
              notes: set.notes || null
            }))
          };
        })
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch template details');
    }
  }

  /**
   * Get student's weekly calendar (API v2.0)
   * @param date Optional date in YYYY-MM-DD format. If omitted, uses current date
   * @returns Promise<WeeklyPlan>
   */
  async getMyWeeklyCalendar(date?: string): Promise<WeeklyPlan> {
    try {
      const url = date ? `/student/my-weekly-calendar?date=${date}` : '/student/my-weekly-calendar';
      const response = await apiClient.get<{message: string, data: any}>(url);
      
      // Extract data from the response structure: {message, data: {week_start, week_end, days}}
      const { data } = response;
      
      return {
        week_start: data.week_start,
        week_end: data.week_end,
        days: data.days?.map((day: any) => ({
          date: day.date,
          day_name: day.day_name,
          day_short: day.day_short,
          day_number: day.day_number,
          has_workouts: day.has_workouts || false,
          assignments: day.assignments?.map((assignment: any) => ({
            id: assignment.id,
            daily_template: {
              id: assignment.daily_template?.id || 0,
              title: assignment.daily_template?.title || 'Entrenamiento',
              goal: assignment.daily_template?.goal || 'strength',
              level: assignment.daily_template?.level || 'beginner',
              estimated_duration_min: assignment.daily_template?.estimated_duration_min || 30
            },
            professor_notes: assignment.professor_notes || '',
            assigned_by: {
              name: assignment.assigned_by?.name || 'Profesor'
            }
          })) || []
        })) || []
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch weekly calendar');
    }
  }

  /**
   * Get professor information for the current student
   * @returns Promise<Professor | null>
   */
  async getMyProfessor(): Promise<Professor | null> {
    try {
      const templates = await this.getMyTemplates();
      return templates.professor;
    } catch (error) {
      console.warn('Failed to get professor info:', error);
      return null;
    }
  }

  /**
   * Check if student has any active templates
   * @returns Promise<boolean>
   */
  async hasActiveTemplates(): Promise<boolean> {
    try {
      const templates = await this.getMyTemplates();
      return templates.templates.some(template => template.status === 'active');
    } catch (error) {
      console.warn('Failed to check active templates:', error);
      return false;
    }
  }

  /**
   * Get today's template assignment (if any)
   * @returns Promise<TemplateAssignment | null>
   */
  async getTodayTemplate(): Promise<TemplateAssignment | null> {
    try {
      const templates = await this.getMyTemplates();
      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
      const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
      
      return templates.templates.find(template => 
        template.status === 'active' && 
        template.frequency_days.includes(todayCapitalized)
      ) || null;
    } catch (error) {
      console.warn('Failed to get today template:', error);
      return null;
    }
  }

  /**
   * Handle API errors and convert to GymError
   * @param error Original error
   * @param defaultMessage Default error message
   * @returns GymError
   */
  private handleError(error: any, defaultMessage: string): GymError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || defaultMessage,
        code: this.mapHttpStatusToErrorCode(error.response.status),
        details: { statusCode: error.response.status },
        userMessage: this.getUserFriendlyMessage(error.response.status),
        retryable: this.isRetryableError(error.response.status)
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Error de conexión. Verifica tu internet.',
        code: 'NETWORK_ERROR',
        userMessage: 'Sin conexión. Verifica tu internet',
        retryable: true
      };
    } else {
      // Other error
      return {
        message: defaultMessage,
        code: 'UNKNOWN_ERROR',
        userMessage: 'Error inesperado. Intenta nuevamente',
        retryable: true
      };
    }
  }

  /**
   * Map HTTP status codes to error codes
   */
  private mapHttpStatusToErrorCode(status: number): GymError['code'] {
    switch (status) {
      case 401:
        return 'UNAUTHORIZED';
      case 404:
        return 'NOT_FOUND';
      case 422:
        return 'VALIDATION_ERROR';
      case 500:
      case 502:
      case 503:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  /**
   * Get user-friendly error messages
   */
  private getUserFriendlyMessage(status: number): string {
    switch (status) {
      case 401:
        return 'Sesión expirada. Inicia sesión nuevamente';
      case 404:
        return 'No se encontró la información solicitada';
      case 422:
        return 'Datos inválidos. Verifica la información';
      case 500:
        return 'Error del servidor. Intenta más tarde';
      case 502:
      case 503:
        return 'Servicio no disponible. Intenta más tarde';
      default:
        return 'Error inesperado. Intenta nuevamente';
    }
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(status: number): boolean {
    // Don't retry auth errors or validation errors
    if (status === 401 || status === 422) {
      return false;
    }
    // Retry server errors and network issues
    return true;
  }

  // ===== NEW: Session Progress Methods (API v2.0) =====

  /**
   * Get student's progress history
   * @param status Optional filter by session status
   * @returns Promise<WorkoutSession[]>
   */
  async getMyProgress(status?: string): Promise<WorkoutSession[]> {
    try {
      const url = status ? `/student/my-progress?status=${status}` : '/student/my-progress';
      const response = await apiClient.get<{message: string, data: {sessions: WorkoutSession[]}}>(url);
      
      return response.data.sessions || [];
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch progress history');
    }
  }

  /**
   * Get session details including progress
   * @param sessionId Session ID
   * @returns Promise<WorkoutSessionDetails>
   */
  async getSessionDetails(sessionId: string): Promise<WorkoutSessionDetails> {
    try {
      const response = await apiClient.get<{message: string, data: WorkoutSessionDetails}>(
        `/student/progress/${sessionId}`
      );
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch session details');
    }
  }

  /**
   * Complete a workout session progress
   * @param sessionId Session ID to complete
   * @param progressData Session progress data
   * @returns Promise<CompleteSessionResponse>
   */
  async completeSession(sessionId: string, progressData: SessionProgress): Promise<CompleteSessionResponse> {
    try {
      const response = await apiClient.post<{message: string, data: CompleteSessionResponse}>(
        `/student/progress/${sessionId}/complete`,
        progressData
      );
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to complete session');
    }
  }
}

// Export singleton instance
export const gymService = new GymService();
export default gymService;
