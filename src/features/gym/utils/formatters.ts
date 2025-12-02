import { WeekDay } from '../../../types/gym';

export const getTodayWeekday = (): WeekDay => {
    const days: WeekDay[] = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];
    const today = new Date().getDay();
    return days[today];
};

export const getWeekdaySpanish = (day: WeekDay): string => {
    const daysMap: Record<WeekDay, string> = {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo',
    };
    return daysMap[day];
};

export const getDayShortName = (day: WeekDay): string => {
    const shortDaysMap: Record<WeekDay, string> = {
        monday: 'LUN',
        tuesday: 'MAR',
        wednesday: 'MIÉ',
        thursday: 'JUE',
        friday: 'VIE',
        saturday: 'SÁB',
        sunday: 'DOM',
    };
    return shortDaysMap[day];
};

export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
};

export const formatRestTime = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds}seg`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) {
        return `${mins}min`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}min`;
};

export const getDifficultyLabel = (level: 'beginner' | 'intermediate' | 'advanced'): string => {
    const labels = {
        beginner: 'Principiante',
        intermediate: 'Intermedio',
        advanced: 'Avanzado',
    };
    return labels[level];
};

export const getMuscleGroupLabel = (muscleGroup: string): string => {
    const labels: Record<string, string> = {
        legs: 'Piernas',
        chest: 'Pecho',
        back: 'Espalda',
        shoulders: 'Hombros',
        arms: 'Brazos',
        core: 'Core',
        full_body: 'Cuerpo completo',
    };
    return labels[muscleGroup] || muscleGroup;
};
