import {
    WeekDay,
    Set as GymSet,
    RawAssignment,
    RawTemplate,
    RawExercise,
    Assignment,
    DailyTemplate,
    RawScheduledTemplate,
    ScheduledTemplate,
} from '../../../types/gym';

export const dayMap: Record<number, WeekDay> = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    7: 'sunday',
};

export const spanishDayMap: Record<string, WeekDay> = {
    Lunes: 'monday',
    Martes: 'tuesday',
    Miércoles: 'wednesday',
    Jueves: 'thursday',
    Viernes: 'friday',
    Sábado: 'saturday',
    Domingo: 'sunday',
};

export const mapBackendToFrontendAssignment = (item: RawAssignment): Assignment => {
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

    const template = item.daily_template || ({} as RawTemplate);

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
            estimated_duration_minutes:
                template.estimated_duration_min || template.estimated_duration_minutes || 60,
            difficulty_level: template.level || template.difficulty_level || 'intermediate',
            is_active: true,
            sets: [], // Se cargarán al ver detalles
        },
    };
};

export const mapExercisesToSets = (exercises: RawExercise[]): GymSet[] => {
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
                totalSets: 1,
            });
        } else {
            // Por cada set, crear una entrada
            exerciseSets.forEach((set: any, setIndex: number) => {
                expandedExercises.push({
                    exerciseData: ex,
                    setData: set,
                    setNumber: set.set_number || setIndex + 1,
                    totalSets: exerciseSets.length,
                });
            });
        }
    });

    // Crear un set único con todos los ejercicios expandidos
    return [
        {
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
                let muscleGroup =
                    exerciseData.target_muscle_groups ||
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
                const repetitions =
                    repsMin && repsMax && repsMin === repsMax
                        ? repsMin
                        : repsMin && repsMax
                            ? `${repsMin}-${repsMax}`
                            : repsMin || repsMax || null;

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
                        difficulty:
                            exerciseData.difficulty_level ||
                            exerciseData.difficulty ||
                            exerciseData.level ||
                            'intermediate',
                        equipment_needed: exerciseData.equipment || exerciseData.equipment_needed || null,
                        video_url: exerciseData.video_url || null,
                        image_url: exerciseData.image_url || null,
                        instructions: exerciseData.instructions || null,
                        is_active: true,
                    },
                };

                return mappedExercise;
            }),
        },
    ];
};

export const mapBackendToFrontendTemplate = (
    templateData: RawTemplate,
    exercises: RawExercise[],
    assignmentId: number
): DailyTemplate => {
    return {
        id: templateData.id || assignmentId,
        name: templateData.title || templateData.name || 'Sin nombre',
        description: templateData.description || null,
        estimated_duration_minutes:
            templateData.estimated_duration_min || templateData.estimated_duration_minutes || 60,
        difficulty_level: templateData.level || templateData.difficulty_level || 'intermediate',
        is_active: templateData.is_active !== false,
        sets: mapExercisesToSets(exercises),
    };
};

export const mapBackendToFrontendScheduledTemplate = (
    assignment: RawScheduledTemplate
): ScheduledTemplate => {
    return {
        template_id: assignment.daily_template?.id || assignment.template_id || assignment.id,
        template_name:
            assignment.daily_template?.title ||
            assignment.template_name ||
            assignment.name ||
            assignment.title ||
            'Sin nombre',
        estimated_duration:
            assignment.daily_template?.estimated_duration_min ||
            assignment.estimated_duration ||
            assignment.estimated_duration_min ||
            60,
        has_progress: assignment.has_progress || false,
    };
};
