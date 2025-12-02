import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { gymService } from '../services/gymService';
import { TemplateWithDetails } from '../../../types/gym';

interface AssignmentsListProps {
  assignments: TemplateWithDetails[];
  loading: boolean;
  onPress: (assignment: TemplateWithDetails) => void;
}

export const AssignmentsList: React.FC<AssignmentsListProps> = ({
  assignments,
  loading,
  onPress,
}) => {
  const getTodayWeekday = () => gymService.getTodayWeekday();

  return (
    <View style={styles.assignmentsSection}>
      <Text style={styles.assignmentsTitle}>Mis Rutinas Asignadas</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.loadingText}>Cargando rutinas...</Text>
        </View>
      ) : assignments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="barbell-outline" size={48} color={COLORS.TEXT_DISABLED} />
          <Text style={styles.emptyStateTitle}>Sin rutinas asignadas</Text>
          <Text style={styles.emptyStateText}>
            Tu profesor aún no te ha asignado ninguna rutina de entrenamiento.
          </Text>
        </View>
      ) : (
        <View style={styles.assignmentsList}>
          {assignments.map((assignment) => (
            <TouchableOpacity
              key={assignment.id}
              style={styles.assignmentCard}
              onPress={() => onPress(assignment)}
            >
              <View style={styles.assignmentHeader}>
                <View style={styles.assignmentIcon}>
                  <Ionicons name="fitness" size={20} color={COLORS.PRIMARY_GREEN} />
                </View>
                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentName}>{assignment.template_name}</Text>
                  <Text style={styles.assignmentMeta}>
                    {gymService.formatDuration(assignment.template.estimated_duration_minutes)} •{' '}
                    {gymService.getDifficultyLabel(assignment.template.difficulty_level)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_DISABLED} />
              </View>
              <View style={styles.assignmentDays}>
                {assignment.assigned_days.map((day, dayIndex) => (
                  <View
                    key={`${assignment.id}-${day}-${dayIndex}`}
                    style={[
                      styles.dayBadge,
                      assignment.assigned_days.includes(getTodayWeekday()) &&
                      day === getTodayWeekday() &&
                      styles.dayBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayBadgeText,
                        assignment.assigned_days.includes(getTodayWeekday()) &&
                        day === getTodayWeekday() &&
                        styles.dayBadgeActiveText,
                      ]}
                    >
                      {gymService.getDayShortName(day)}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  assignmentsSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assignmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: 'BarlowCondensed-Bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  assignmentsList: {
    gap: 12,
  },
  assignmentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  assignmentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  assignmentMeta: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  assignmentDays: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  dayBadgeActive: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderColor: COLORS.PRIMARY_GREEN,
  },
  dayBadgeActiveText: {
    color: COLORS.WHITE,
    fontWeight: '700',
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
});
