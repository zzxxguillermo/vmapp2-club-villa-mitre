import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Set } from '../../types/gym';
import { ExerciseDetailCard } from './ExerciseDetailCard';

interface SetCardProps {
  set: Set;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

const SET_TYPE_CONFIG = {
  normal: {
    label: 'Normal',
    color: COLORS.PRIMARY_GREEN,
    icon: 'fitness-outline' as const,
  },
  superset: {
    label: 'Superset',
    color: '#FF9800',
    icon: 'flash-outline' as const,
  },
  circuit: {
    label: 'Circuit',
    color: '#2196F3',
    icon: 'repeat-outline' as const,
  },
};

export const SetCard: React.FC<SetCardProps> = ({
  set,
  index,
  expanded,
  onToggle,
}) => {
  const [expandedExercises, setExpandedExercises] = useState<{ [key: number]: boolean }>({});
  
  const config = SET_TYPE_CONFIG[set.type];

  const toggleExercise = (exerciseId: number) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const formatRestTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}seg`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}min`;
    return `${mins}:${secs.toString().padStart(2, '0')}min`;
  };

  return (
    <View style={[styles.container, { borderLeftColor: config.color }]}>
      {/* Header del Set */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.setNumberBadge, { backgroundColor: config.color }]}>
            <Text style={styles.setNumberText}>SET {index + 1}</Text>
          </View>
          
          <View style={styles.setInfo}>
            <Text style={styles.setName}>{set.name}</Text>
            
            <View style={styles.setMeta}>
              <View style={[styles.typeBadge, { backgroundColor: `${config.color}20` }]}>
                <Ionicons name={config.icon} size={12} color={config.color} />
                <Text style={[styles.typeText, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
              
              <View style={styles.exerciseCount}>
                <Ionicons name="list-outline" size={12} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.exerciseCountText}>
                  {set.exercises.length} ejercicio{set.exercises.length !== 1 ? 's' : ''}
                </Text>
              </View>
              
              {set.rest_after_set_seconds > 0 && (
                <View style={styles.restTimeBadge}>
                  <Ionicons name="time-outline" size={12} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.restTimeBadgeText}>
                    Descanso: {formatRestTime(set.rest_after_set_seconds)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up-circle' : 'chevron-down-circle'}
          size={28}
          color={config.color}
        />
      </TouchableOpacity>

      {/* Body del Set - Solo visible cuando está expandido */}
      {expanded && (
        <View style={styles.body}>
          {/* Notas del set */}
          {set.notes && (
            <View style={styles.setNotes}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.INFO} />
              <Text style={styles.setNotesText}>{set.notes}</Text>
            </View>
          )}

          {/* Etiqueta de ejercicios */}
          <View style={styles.exercisesHeader}>
            <Ionicons name="barbell-outline" size={18} color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.exercisesHeaderText}>Ejercicios</Text>
          </View>

          {/* Lista de ejercicios */}
          <View style={styles.exercisesList}>
            {set.exercises
              .sort((a, b) => a.order - b.order)
              .map((setExercise, idx) => (
                <ExerciseDetailCard
                  key={setExercise.id}
                  setExercise={setExercise}
                  index={idx}
                  expanded={expandedExercises[setExercise.id]}
                  onToggle={() => toggleExercise(setExercise.id)}
                />
              ))}
          </View>

          {/* Descanso después del set */}
          <View style={styles.restAfterSet}>
            <View style={styles.restIcon}>
              <Ionicons name="time-outline" size={24} color={COLORS.PRIMARY_GREEN} />
            </View>
            <View style={styles.restContent}>
              <Text style={styles.restLabel}>Descanso después del set</Text>
              <Text style={styles.restTime}>{formatRestTime(set.rest_after_set_seconds)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  setNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  setNumberText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  setMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  exerciseCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCountText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  body: {
    padding: 16,
  },
  setNotes: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.INFO}10`,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.INFO,
    marginBottom: 16,
  },
  setNotesText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
    lineHeight: 20,
  },
  exercisesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY_GREEN,
  },
  exercisesHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  exercisesList: {
    marginBottom: 16,
  },
  restAfterSet: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_GREEN,
  },
  restIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  restContent: {
    flex: 1,
  },
  restLabel: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  restTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
  },
  restTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  restTimeBadgeText: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
});

export default SetCard;
