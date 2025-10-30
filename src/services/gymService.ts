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
  WeekDay,
  Set as GymSet
} from '../types/gym';

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
      const response = await apiClient.get<any>(
        `/student/my-templates`
      );
      
      // Backend devuelve estructura: {data: {templates: [...], professor: {...}}}
      const templates = response?.data?.templates || response?.templates || [];
      
      if (__DEV__) {
        console.log('📋 Templates from backend:', templates);
      }
      
      // Mapear estructura del backend a nuestro tipo Assignment
      return templates.map((item: any) => {
        // Mapear frequency array [1,2,3,4,5] a días de la semana
        const dayMap: any = {
          1: 'monday',
          2: 'tuesday', 
          3: 'wednesday',
          4: 'thursday',
          5: 'friday',
          6: 'saturday',
          7: 'sunday'
        };
        
        const assignedDays = (item.frequency || []).map((num: number) => dayMap[num] || 'monday');
        
        // Determinar frequency type según cantidad de días
        let frequencyType: Assignment['frequency'] = '1x_week';
        const daysCount = assignedDays.length;
        if (daysCount === 1) frequencyType = '1x_week';
        else if (daysCount === 2) frequencyType = '2x_week';
        else if (daysCount === 3) frequencyType = '3x_week';
        else if (daysCount === 4) frequencyType = '4x_week';
        else if (daysCount === 5) frequencyType = '5x_week';
        else if (daysCount >= 6) frequencyType = 'daily';
        
        const template = item.daily_template || {};
        
        return {
          id: item.id,
          daily_template_id: template.id || 0,
          template_name: template.title || template.name || 'Sin nombre',
          frequency: frequencyType,
          assigned_days: assignedDays,
          start_date: item.start_date || '',
          end_date: item.end_date || null,
          is_active: item.status === 'active',
          template: {
            id: template.id || 0,
            name: template.title || template.name || 'Sin nombre',
            description: template.description || null,
            estimated_duration_minutes: template.estimated_duration_min || template.estimated_duration_minutes || 60,
            difficulty_level: template.level || template.difficulty_level || 'intermediate',
            is_active: true,
            sets: [] // Se cargarán al ver detalles
          }
        };
      });
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
      const response = await apiClient.get<any>(
        `/student/template/${assignmentId}/details`
      );
      
      // Backend devuelve: {data: {template: {...}, exercises: [...], assignment_info: {...}}}
      const templateData = response?.data?.template || response?.template || {};
      const exercises = response?.data?.exercises || response?.exercises || [];
      
      
      // Mapear a nuestro tipo DailyTemplate
      return {
        id: templateData.id || assignmentId,
        name: templateData.title || templateData.name || 'Sin nombre',
        description: templateData.description || null,
        estimated_duration_minutes: templateData.estimated_duration_min || templateData.estimated_duration_minutes || 60,
        difficulty_level: templateData.level || templateData.difficulty_level || 'intermediate',
        is_active: templateData.is_active !== false,
        sets: this.mapExercisesToSets(exercises) // Convertir ejercicios a sets
      };
    } catch (error: any) {
      console.error('Failed to fetch template details:', error);
      throw this.handleError(error, 'Failed to fetch template');
    }
  }
  
  /**
   * Mapear ejercicios del backend a estructura de Sets
   * Cada ejercicio puede tener múltiples sets con diferentes parámetros
   */
  private mapExercisesToSets(exercises: any[]): GymSet[] {
    if (!exercises || exercises.length === 0) {
      return [];
    }
    
    // Expandir ejercicios: cada set del backend se convierte en un SetExercise
    const expandedExercises: any[] = [];
    
    exercises.forEach((ex: any, exIndex: number) => {
      const exerciseSets = ex.sets || [];
      
      if (exerciseSets.length === 0) {
        // Si no tiene sets, crear uno vacío
        expandedExercises.push({
          exerciseData: ex,
          setData: null,
          setNumber: 1,
          totalSets: 1
        });
      } else {
        // Por cada set, crear una entrada
        exerciseSets.forEach((set: any, setIndex: number) => {
          expandedExercises.push({
            exerciseData: ex,
            setData: set,
            setNumber: set.set_number || (setIndex + 1),
            totalSets: exerciseSets.length
          });
        });
      }
    });
    
    // Crear un set único con todos los ejercicios expandidos
    return [{
      id: 1,
      name: 'Ejercicios',
      order: 1,
      type: 'normal',
      rest_after_set_seconds: 60,
      notes: null,
      exercises: expandedExercises.map((item: any, index: number) => {
        const ex = item.exerciseData;
        const set = item.setData;
        // El ejercicio puede venir directamente o dentro de ex.exercise
        const exerciseData = ex.exercise || ex;
        
        // Asegurar valores seguros para muscle_group
        let muscleGroup = exerciseData.target_muscle_groups || 
                         exerciseData.muscle_group || 
                         exerciseData.muscleGroup || 
                         'full_body';
        
        // Si es un array, tomar el primero
        if (Array.isArray(muscleGroup)) {
          muscleGroup = muscleGroup[0] || 'full_body';
        }
        
        // Asegurar que sea string
        if (typeof muscleGroup !== 'string') {
          muscleGroup = 'full_body';
        }
        
        // Extraer datos del set (si existe)
        const repsMin = set?.reps_min || null;
        const repsMax = set?.reps_max || null;
        const repetitions = repsMin && repsMax && repsMin === repsMax 
          ? repsMin 
          : (repsMin && repsMax ? `${repsMin}-${repsMax}` : repsMin || repsMax || null);
        
        const weightTarget = set?.weight_target || null;
        const weightMin = set?.weight_min || null;
        const weightMax = set?.weight_max || null;
        
        // Determinar el peso a mostrar (sin agregar "kg" aquí, se hará en el componente)
        let weight = null;
        if (weightTarget !== null) {
          weight = weightTarget;
        } else if (weightMin !== null && weightMax !== null) {
          if (weightMin === weightMax) {
            weight = weightMin;
          } else {
            weight = `${weightMin}-${weightMax}`;
          }
        } else if (weightMin !== null) {
          weight = weightMin;
        } else if (weightMax !== null) {
          weight = weightMax;
        }
        
        const restSeconds = set?.rest_seconds || 30;
        const setNotes = set?.notes || ex.notes || null;
        
        const mappedExercise = {
          id: (ex.id || index) * 1000 + item.setNumber,
          exercise_id: exerciseData.id || ex.exercise_id || index,
          order: index + 1,
          repetitions: repetitions,
          weight_kg: weight,
          duration_seconds: null,
          distance_meters: null,
          rest_after_seconds: restSeconds,
          notes: setNotes,
          exercise: {
            id: exerciseData.id || index,
            name: `${exerciseData.name || exerciseData.title || ex.name || 'Ejercicio sin nombre'}${item.totalSets > 1 ? ` - Set ${item.setNumber}/${item.totalSets}` : ''}`,
            description: exerciseData.description || null,
            category: exerciseData.category || 'strength',
            muscle_group: muscleGroup,
            difficulty: exerciseData.difficulty_level || exerciseData.difficulty || exerciseData.level || 'intermediate',
            equipment_needed: exerciseData.equipment || exerciseData.equipment_needed || null,
            video_url: exerciseData.video_url || null,
            image_url: exerciseData.image_url || null,
            instructions: exerciseData.instructions || null,
            is_active: true
          }
        };
        
        return mappedExercise;
      })
    }];
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
        
      const response = await apiClient.get<any>(endpoint);
      
      if (__DEV__) {
        console.log('📅 RESPUESTA COMPLETA CALENDARIO:', JSON.stringify(response, null, 2));
      }
      
      // Backend puede devolver diferentes estructuras
      const scheduleData = response?.data?.days || response?.schedule || {};
      
      if (__DEV__) {
        console.log('📋 scheduleData extraído:', JSON.stringify(scheduleData, null, 2));
        console.log('📋 Es array?:', Array.isArray(scheduleData));
      }
      
      // Mapear días del backend a nuestro formato
      const schedule: WeeklyScheduleResponse['schedule'] = {};
      
      // Si scheduleData es un array de días
      if (Array.isArray(scheduleData)) {
        const dayMap: any = {
          'Lunes': 'monday',
          'Martes': 'tuesday',
          'Miércoles': 'wednesday',
          'Jueves': 'thursday',
          'Viernes': 'friday',
          'Sábado': 'saturday',
          'Domingo': 'sunday'
        };
        
        scheduleData.forEach((dayInfo: any) => {
          const dayName = dayMap[dayInfo.day_name] || dayInfo.day?.toLowerCase();
          if (__DEV__) {
            console.log(`📆 Día: ${dayInfo.day_name} → ${dayName}`, {
              assignments: dayInfo.assignments?.length || 0,
              templates: dayInfo.templates?.length || 0,
              has_workouts: dayInfo.has_workouts
            });
          }
          
          // El backend devuelve 'assignments' no 'templates'
          const assignments = dayInfo.assignments || dayInfo.templates || [];
          if (dayName && assignments.length > 0) {
            schedule[dayName as WeekDay] = assignments.map((assignment: any) => ({
              template_id: assignment.daily_template?.id || assignment.template_id || assignment.id,
              template_name: assignment.daily_template?.title || assignment.template_name || assignment.name || assignment.title,
              estimated_duration: assignment.daily_template?.estimated_duration_min || assignment.estimated_duration || assignment.estimated_duration_min || 60,
              has_progress: assignment.has_progress || false
            }));
          }
        });
      } else {
        // Si scheduleData es un objeto con días como propiedades
        Object.keys(scheduleData).forEach(day => {
          const templates = scheduleData[day];
          if (Array.isArray(templates)) {
            schedule[day as WeekDay] = templates.map((t: any) => ({
              template_id: t.template_id || t.id,
              template_name: t.template_name || t.name || t.title,
              estimated_duration: t.estimated_duration || t.estimated_duration_min || 60,
              has_progress: t.has_progress || false
            }));
          }
        });
      }
      
      if (__DEV__) {
        console.log('✅ SCHEDULE FINAL:', JSON.stringify(schedule, null, 2));
        console.log('📊 Días con entrenamientos:', Object.keys(schedule).filter(day => {
          const daySchedule = schedule[day as WeekDay];
          return daySchedule && daySchedule.length > 0;
        }));
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
  
  /**
   * Get today's weekday name
   * @returns WeekDay
   */
  getTodayWeekday(): WeekDay {
    const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    return days[today];
  }
  
  /**
   * Get weekday name in Spanish
   * @param day English weekday name
   * @returns Spanish weekday name
   */
  getWeekdaySpanish(day: WeekDay): string {
    const daysMap: Record<WeekDay, string> = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return daysMap[day];
  }

  /**
   * Get short day name (3 letters)
   * @param day English weekday name
   * @returns Short Spanish weekday name
   */
  getDayShortName(day: WeekDay): string {
    const shortDaysMap: Record<WeekDay, string> = {
      monday: 'LUN',
      tuesday: 'MAR',
      wednesday: 'MIÉ',
      thursday: 'JUE',
      friday: 'VIE',
      saturday: 'SÁB',
      sunday: 'DOM'
    };
    return shortDaysMap[day];
  }
  
  /**
   * Format duration in human readable format
   * @param minutes Duration in minutes
   * @returns Formatted string
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
  }
  
  /**
   * Format rest time in seconds
   * @param seconds Rest time in seconds
   * @returns Formatted string
   */
  formatRestTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}seg`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) {
      return `${mins}min`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}min`;
  }
  
  /**
   * Get difficulty level label in Spanish
   * @param level Difficulty level
   * @returns Spanish label
   */
  getDifficultyLabel(level: 'beginner' | 'intermediate' | 'advanced'): string {
    const labels = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    };
    return labels[level];
  }
  
  /**
   * Get muscle group label in Spanish
   * @param muscleGroup Muscle group
   * @returns Spanish label
   */
  getMuscleGroupLabel(muscleGroup: string): string {
    const labels: Record<string, string> = {
      legs: 'Piernas',
      chest: 'Pecho',
      back: 'Espalda',
      shoulders: 'Hombros',
      arms: 'Brazos',
      core: 'Core',
      full_body: 'Cuerpo completo'
    };
    return labels[muscleGroup] || muscleGroup;
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
