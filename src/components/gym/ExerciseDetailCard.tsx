import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SetExercise } from '../../types/gym';
import { CategoryBadge } from './CategoryBadge';
import { DifficultyBadge } from './DifficultyBadge';

interface ExerciseDetailCardProps {
  setExercise: SetExercise;
  index: number;
  expanded?: boolean;
  onToggle?: () => void;
}

export const ExerciseDetailCard: React.FC<ExerciseDetailCardProps> = ({
  setExercise,
  index,
  onToggle,
  expanded = false,
}) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const exercise = setExercise.exercise;

  // Debug temporal
  if (__DEV__ && index === 0) {
    console.log('🎯 ExerciseDetailCard datos:', {
      name: exercise.name,
      repetitions: setExercise.repetitions,
      weight_kg: setExercise.weight_kg,
      rest_after_seconds: setExercise.rest_after_seconds
    });
  }

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}seg`;
    if (secs === 0) return `${mins}min`;
    return `${mins}:${secs.toString().padStart(2, '0')}min`;
  };

  const formatWeight = (weight: number | string | null): string => {
    if (!weight) return '';
    if (typeof weight === 'string') {
      // Si ya es string con rango, agregar "kg" si no lo tiene
      return weight.includes('kg') ? weight : `${weight}kg`;
    }
    if (Number.isInteger(weight)) return `${weight}kg`;
    return `${weight.toFixed(1)}kg`;
  };
  
  const formatReps = (reps: number | string | null): string => {
    if (!reps) return '';
    return String(reps); // Convierte a string, puede ser "12" o "12-15"
  };

  const handleVideoPress = () => {
    if (exercise.video_url) {
      Linking.openURL(exercise.video_url);
    }
  };

  const renderEquipment = () => {
    if (!exercise.equipment_needed) return null;
    
    const items = exercise.equipment_needed.split(',').map(item => item.trim());
    
    return (
      <View style={styles.equipmentContainer}>
        <Ionicons name="construct-outline" size={16} color={COLORS.TEXT_SECONDARY} />
        <View style={styles.equipmentList}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.equipmentItem}>
              <Text style={styles.equipmentText}>• {item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderInstructions = () => {
    if (!exercise.instructions) return null;

    const steps = exercise.instructions
      .split('\n')
      .filter(step => step.trim())
      .map(step => step.replace(/^\d+\.\s*/, '').trim());

    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          <Ionicons name="list-outline" size={16} color={COLORS.PRIMARY_GREEN} />
          {' '}Instrucciones:
        </Text>
        {steps.map((step, idx) => (
          <View key={idx} style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{idx + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, expanded && styles.containerExpanded]}
      onPress={onToggle}
      activeOpacity={0.7}
      disabled={!onToggle}
    >
      {/* Header - Siempre visible */}
      <View style={styles.header}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{index + 1}</Text>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          
          {/* Parámetros principales - Grid compacto */}
          <View style={styles.mainParameters}>
            {setExercise.repetitions && (
              <View style={styles.mainParameter}>
                <Ionicons name="repeat-outline" size={18} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.mainParameterValue}>{formatReps(setExercise.repetitions)}</Text>
                <Text style={styles.mainParameterLabel}>reps</Text>
              </View>
            )}
            
            {setExercise.weight_kg && (
              <View style={styles.mainParameter}>
                <Ionicons name="barbell-outline" size={18} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.mainParameterValue}>{formatWeight(setExercise.weight_kg)}</Text>
              </View>
            )}
            
            {setExercise.duration_seconds && (
              <View style={styles.mainParameter}>
                <Ionicons name="timer-outline" size={18} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.mainParameterValue}>{formatDuration(setExercise.duration_seconds)}</Text>
              </View>
            )}
            
            {setExercise.distance_meters && (
              <View style={styles.mainParameter}>
                <Ionicons name="flag-outline" size={18} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.mainParameterValue}>{setExercise.distance_meters}m</Text>
              </View>
            )}
            
            <View style={styles.mainParameter}>
              <Ionicons name="time-outline" size={16} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.mainParameterRest}>{setExercise.rest_after_seconds}seg</Text>
            </View>
          </View>
          
          {!setExercise.repetitions && !setExercise.weight_kg && !setExercise.duration_seconds && !setExercise.distance_meters && (
            <View style={styles.noParameters}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.noParametersText}>⚠️ Rutina sin personalizar - Consulta con tu profesor</Text>
            </View>
          )}
        </View>

        {onToggle && (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.TEXT_SECONDARY}
            style={styles.expandIcon}
          />
        )}
      </View>

      {/* Body - Solo visible cuando está expandido */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Imagen del ejercicio - Solo si existe */}
          {exercise.image_url && !imageError && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: exercise.image_url }}
                style={styles.exerciseImage}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              {imageLoading && (
                <View style={styles.imageLoading}>
                  <ActivityIndicator size="small" color={COLORS.PRIMARY_GREEN} />
                </View>
              )}
            </View>
          )}

          {/* Descripción */}
          {exercise.description && (
            <Text style={styles.description}>{exercise.description}</Text>
          )}

          {/* Badges de categoría y dificultad */}
          <View style={styles.badges}>
            <CategoryBadge category={exercise.category} showIcon={true} />
            <DifficultyBadge level={exercise.difficulty} size="small" showIcon={false} />
          </View>

          {/* Grupo muscular */}
          {exercise.muscle_group && (
            <View style={styles.muscleGroup}>
              <Ionicons name="body-outline" size={16} color={COLORS.PRIMARY_GREEN} />
              <Text style={styles.muscleGroupText}>
                {exercise.muscle_group.charAt(0).toUpperCase() + exercise.muscle_group.slice(1)}
              </Text>
            </View>
          )}

          {/* Equipamiento necesario */}
          {renderEquipment()}

          {/* Instrucciones */}
          {renderInstructions()}

          {/* Notas específicas del ejercicio en este set */}
          {setExercise.notes && (
            <View style={styles.notes}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.INFO} />
              <Text style={styles.notesText}>{setExercise.notes}</Text>
            </View>
          )}

          {/* Botón de video */}
          {exercise.video_url && (
            <TouchableOpacity style={styles.videoButton} onPress={handleVideoPress}>
              <Ionicons name="play-circle-outline" size={20} color={COLORS.WHITE} />
              <Text style={styles.videoButtonText}>Ver Video Tutorial</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    overflow: 'hidden',
  },
  containerExpanded: {
    borderColor: COLORS.PRIMARY_GREEN,
    shadowColor: COLORS.PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingRight: 12,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  orderText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    marginRight: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  mainParameters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  mainParameter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  mainParameterLabel: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
  },
  mainParameterValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
  },
  mainParameterRest: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  noParameters: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noParametersText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
  },
  expandIcon: {
    marginLeft: 8,
    flexShrink: 0,
    alignSelf: 'center',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_LIGHT,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  imageLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  muscleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  muscleGroupText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    marginLeft: 8,
  },
  equipmentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    padding: 12,
    borderRadius: 8,
  },
  equipmentList: {
    flex: 1,
    marginLeft: 8,
  },
  equipmentItem: {
    marginBottom: 4,
  },
  equipmentText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  instructionsContainer: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  notes: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.INFO}15`,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.INFO,
    marginBottom: 16,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
    lineHeight: 18,
  },
  videoButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY_GREEN,
    padding: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ExerciseDetailCard;
