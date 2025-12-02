import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { gymService } from '../services/gymService';
import { Assignment, DailyTemplate, TemplateWithDetails } from '../../../types/gym';



interface TodayWorkoutProps {
  assignments: TemplateWithDetails[];
  loading: boolean;
  onPress: (assignment: TemplateWithDetails) => void;
}

export const TodayWorkout: React.FC<TodayWorkoutProps> = ({ assignments, loading, onPress }) => {
  const getTodayAssignments = () => {
    const today = gymService.getTodayWeekday();
    return assignments.filter((a) => a.assigned_days.includes(today));
  };

  const todayAssignments = getTodayAssignments();

  if (loading) return null;

  return (
    <View style={styles.todaySection}>
      <View style={styles.todaySectionHeader}>
        <View style={styles.todayBadge}>
          <Ionicons name="today" size={18} color={COLORS.WHITE} />
          <Text style={styles.todayBadgeText}>HOY</Text>
        </View>
        <Text style={styles.todaySectionTitle}>
          {todayAssignments.length > 0 ? 'Tu Entrenamiento' : 'Día de Descanso'}
        </Text>
      </View>

      {todayAssignments.length === 0 && (
        <View style={styles.restDayCard}>
          <Ionicons name="bed-outline" size={48} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.restDayTitle}>Hoy es día de descanso</Text>
          <Text style={styles.restDayText}>
            Aprovecha para recuperarte. Tus próximos entrenamientos están en el calendario.
          </Text>
        </View>
      )}

      {todayAssignments.length > 0 && (
        <View style={styles.todayWorkoutContainer}>
          {todayAssignments.map((assignment) => {
            const template = assignment.fullTemplate || assignment.template;
            const sets = template?.sets || [];
            const totalExercises = sets.reduce((acc, set) => acc + (set.exercises?.length || 0), 0);

            return (
              <TouchableOpacity
                key={assignment.id}
                style={styles.todayWorkoutCard}
                onPress={() => onPress(assignment)}
                activeOpacity={0.9}
              >
                {/* Header con nombre y nivel */}
                <View style={styles.todayWorkoutHeader}>
                  <Text style={styles.todayWorkoutTitle}>{assignment.template_name}</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>
                      {gymService
                        .getDifficultyLabel(assignment.template.difficulty_level)
                        .toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="time-outline" size={24} color={COLORS.PRIMARY_GREEN} />
                    </View>
                    <Text style={styles.statValue}>
                      {assignment.template.estimated_duration_minutes}
                    </Text>
                    <Text style={styles.statLabel}>minutos</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="barbell-outline" size={24} color={COLORS.PRIMARY_GREEN} />
                    </View>
                    <Text style={styles.statValue}>{totalExercises}</Text>
                    <Text style={styles.statLabel}>ejercicios</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Ionicons name="layers-outline" size={24} color={COLORS.PRIMARY_GREEN} />
                    </View>
                    <Text style={styles.statValue}>{sets.length}</Text>
                    <Text style={styles.statLabel}>sets</Text>
                  </View>
                </View>

                {/* CTA Button */}
                <View style={styles.todayWorkoutCTA}>
                  <Text style={styles.todayWorkoutCTAText}>VER ENTRENAMIENTO</Text>
                  <Ionicons name="arrow-forward-circle" size={24} color={COLORS.WHITE} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  todaySection: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
  },
  todaySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    letterSpacing: 1,
  },
  todaySectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: 'BarlowCondensed-Bold',
  },
  restDayCard: {
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_GREEN + '30',
  },
  restDayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  restDayText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  todayWorkoutContainer: {
    // Container vacío
  },
  todayWorkoutCard: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  todayWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  todayWorkoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    flex: 1,
    marginRight: 12,
    fontFamily: 'BarlowCondensed-Bold',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
  },
  todayWorkoutCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 16,
    gap: 8,
  },
  todayWorkoutCTAText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
