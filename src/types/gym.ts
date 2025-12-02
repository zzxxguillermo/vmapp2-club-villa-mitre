// ============================================
// GYM SERVICE TYPES - API v2.0
// Updated: October 2025
// Based on official backend endpoints
// ============================================

// ===== CORE TYPES =====

// Exercise (complete exercise information)
export interface ExerciseDetails {
  id: number;
  name: string;
  description: string | null;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance';
  muscle_group: 'legs' | 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'full_body';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment_needed: string | null;
  video_url: string | null;
  image_url: string | null;
  instructions: string | null;
  is_active: boolean;
}

// SetExercise (exercise within a set)
export interface SetExercise {
  id: number;
  exercise_id: number;
  order: number;
  repetitions: number | null;
  weight_kg: number | null; // Can be decimal: 7.5, 10.25, etc.
  duration_seconds: number | null;
  distance_meters: number | null;
  rest_after_seconds: number;
  notes: string | null;
  exercise: ExerciseDetails;
}

// Set (group of exercises)
export interface Set {
  id: number;
  name: string;
  order: number;
  type: 'normal' | 'superset' | 'circuit';
  rest_after_set_seconds: number;
  notes: string | null;
  exercises: SetExercise[];
}

// DailyTemplate (daily workout template)
export interface DailyTemplate {
  id: number;
  name: string;
  description: string | null;
  estimated_duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  sets: Set[];
}

// Assignment (template assignment to student)
export interface Assignment {
  id: number;
  daily_template_id: number;
  template_name: string;
  frequency: '1x_week' | '2x_week' | '3x_week' | '4x_week' | '5x_week' | 'daily';
  assigned_days: (
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'
  )[];
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  is_active: boolean;
  template: DailyTemplate;
}

export interface TemplateWithDetails extends Assignment {
  detailsLoaded?: boolean;
  fullTemplate?: DailyTemplate;
}

// ===== API RESPONSES =====

// GET /api/professor/students/{studentId}/assignments
export interface AssignmentsResponse {
  success: boolean;
  assignments: Assignment[];
}

// GET /api/admin/gym/daily-templates/{id}
export interface TemplateDetailsResponse {
  success: boolean;
  template: DailyTemplate;
}

// GET /api/professor/students/{studentId}/weekly-schedule
export interface WeeklyScheduleResponse {
  success: boolean;
  schedule: {
    monday?: ScheduledTemplate[];
    tuesday?: ScheduledTemplate[];
    wednesday?: ScheduledTemplate[];
    thursday?: ScheduledTemplate[];
    friday?: ScheduledTemplate[];
    saturday?: ScheduledTemplate[];
    sunday?: ScheduledTemplate[];
  };
}

export interface ScheduledTemplate {
  template_id: number;
  template_name: string;
  estimated_duration: number;
  has_progress: boolean;
}

// GET /api/admin/gym/exercises
export interface ExercisesListResponse {
  success: boolean;
  exercises: ExerciseDetails[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
  };
}

// ===== UTILITY TYPES =====

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// ===== RAW BACKEND TYPES (for internal mapping) =====

export interface RawTemplate {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  estimated_duration_min?: number;
  estimated_duration_minutes?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  is_active?: boolean;
  sets?: RawSet[];
}

export interface RawAssignment {
  id: number;
  daily_template?: RawTemplate;
  template?: RawTemplate;
  frequency?: number[];
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface RawSet {
  set_number?: number;
  reps_min?: number;
  reps_max?: number;
  weight_target?: number;
  weight_min?: number;
  weight_max?: number;
  rest_seconds?: number;
  notes?: string;
  exercises?: RawExercise[];
}

export interface RawExercise {
  id: number;
  exercise_id?: number;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  target_muscle_groups?: string[];
  muscle_group?: string;
  muscleGroup?: string;
  difficulty_level?: string;
  difficulty?: string;
  level?: string;
  equipment?: string;
  equipment_needed?: string;
  video_url?: string;
  image_url?: string;
  instructions?: string;
  sets?: RawSet[];
}

export interface MyTemplatesResponse {
  data?: {
    templates: RawAssignment[];
  };
  templates?: RawAssignment[];
}

export interface StudentTemplateDetailsResponse {
  data?: {
    template: RawTemplate;
    exercises: RawExercise[];
  };
  template?: RawTemplate;
  exercises?: RawExercise[];
}

export interface RawScheduledTemplate {
  id: number;
  template_id?: number;
  daily_template?: RawTemplate;
  template_name?: string;
  name?: string;
  title?: string;
  estimated_duration?: number;
  estimated_duration_min?: number;
  has_progress?: boolean;
}

export interface RawDaySchedule {
  day_name?: string;
  day?: string;
  assignments?: RawScheduledTemplate[];
  templates?: RawScheduledTemplate[];
}

export interface StudentWeeklyScheduleResponse {
  data?: {
    days?: RawDaySchedule[];
  };
  schedule?: Record<string, RawScheduledTemplate[]> | RawDaySchedule[];
  days?: RawDaySchedule[];
}

