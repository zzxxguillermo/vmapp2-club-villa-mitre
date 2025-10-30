import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { WeekDay, ScheduledTemplate, DailyTemplate } from '../../types/gym';
import { gymService } from '../../services/gymService';
import { SetCard } from './SetCard';

interface WeekDayCardProps {
  day: WeekDay;
  templates: ScheduledTemplate[];
  isToday: boolean;
  onTemplatePress: (templateId: number, templateName: string) => void;
}

const DAY_NAMES: Record<WeekDay, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const WeekDayCard: React.FC<WeekDayCardProps> = ({
  day,
  templates,
  isToday,
  onTemplatePress,
}) => {
  const [expandedTemplates, setExpandedTemplates] = useState<{ [key: number]: boolean }>({});
  const [templateDetails, setTemplateDetails] = useState<{ [key: number]: DailyTemplate | null }>({});
  const [loadingDetails, setLoadingDetails] = useState<{ [key: number]: boolean }>({});
  const [expandedSets, setExpandedSets] = useState<{ [key: number]: boolean }>({});

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const toggleTemplate = async (templateId: number) => {
    const isExpanding = !expandedTemplates[templateId];
    
    setExpandedTemplates(prev => ({
      ...prev,
      [templateId]: isExpanding
    }));

    // Si está expandiendo y no tenemos los detalles, cargarlos
    if (isExpanding && !templateDetails[templateId]) {
      setLoadingDetails(prev => ({ ...prev, [templateId]: true }));
      try {
        const details = await gymService.getTemplateDetails(templateId);
        setTemplateDetails(prev => ({ ...prev, [templateId]: details }));
      } catch (error) {
        console.error('Error loading template details:', error);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [templateId]: false }));
      }
    }
  };

  const toggleSet = (setId: number) => {
    setExpandedSets(prev => ({
      ...prev,
      [setId]: !prev[setId]
    }));
  };

  return (
    <View style={[styles.container, isToday && styles.containerToday]}>
      {/* Header del día */}
      <View style={[styles.header, isToday && styles.headerToday]}>
        {isToday && (
          <View style={styles.todayBadge}>
            <Ionicons name="today-outline" size={16} color={COLORS.WHITE} />
          </View>
        )}
        <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
          {DAY_NAMES[day]}
        </Text>
        {templates.length > 0 && (
          <View style={[styles.countBadge, isToday && styles.countBadgeToday]}>
            <Text style={styles.countText}>{templates.length}</Text>
          </View>
        )}
      </View>

      {/* Lista de rutinas */}
      {templates.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.TEXT_DISABLED} />
          <Text style={styles.emptyText}>Día de descanso</Text>
        </View>
      ) : (
        <View style={styles.templatesList}>
          {templates.map((template, index) => (
            <View key={`${template.template_id}-${index}`} style={styles.templateContainer}>
              {/* Header de la plantilla */}
              <TouchableOpacity
                style={styles.templateCard}
                onPress={() => toggleTemplate(template.template_id)}
                activeOpacity={0.7}
              >
                <View style={styles.templateIcon}>
                  <Ionicons name="barbell" size={20} color={COLORS.PRIMARY_GREEN} />
                </View>
                
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.template_name}</Text>
                  <View style={styles.templateMeta}>
                    <Ionicons name="time-outline" size={12} color={COLORS.TEXT_SECONDARY} />
                    <Text style={styles.templateDuration}>
                      {formatDuration(template.estimated_duration)}
                    </Text>
                    
                    {template.has_progress && (
                      <>
                        <View style={styles.metaSeparator} />
                        <Ionicons name="checkmark-circle" size={12} color={COLORS.SUCCESS} />
                        <Text style={styles.progressText}>Completado</Text>
                      </>
                    )}
                  </View>
                </View>

                <Ionicons 
                  name={expandedTemplates[template.template_id] ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.TEXT_SECONDARY} 
                />
              </TouchableOpacity>

              {/* Contenido expandido con ejercicios */}
              {expandedTemplates[template.template_id] && (
                <View style={styles.expandedContent}>
                  {loadingDetails[template.template_id] ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.PRIMARY_GREEN} />
                      <Text style={styles.loadingText}>Cargando ejercicios...</Text>
                    </View>
                  ) : templateDetails[template.template_id] ? (
                    <View style={styles.setsContainer}>
                      {templateDetails[template.template_id]!.sets.map((set, setIndex) => (
                        <SetCard
                          key={set.id}
                          set={set}
                          index={setIndex}
                          expanded={expandedSets[set.id] || false}
                          onToggle={() => toggleSet(set.id)}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle-outline" size={24} color={COLORS.ERROR} />
                      <Text style={styles.errorText}>Error al cargar ejercicios</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    overflow: 'hidden',
  },
  containerToday: {
    borderColor: COLORS.PRIMARY_GREEN,
    borderWidth: 2,
    shadowColor: COLORS.PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  headerToday: {
    backgroundColor: COLORS.PRIMARY_GREEN,
  },
  todayBadge: {
    marginRight: 8,
  },
  dayName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  dayNameToday: {
    color: COLORS.WHITE,
  },
  countBadge: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeToday: {
    backgroundColor: COLORS.WHITE,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  templatesList: {
    padding: 12,
  },
  templateContainer: {
    marginBottom: 12,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    padding: 12,
    borderRadius: 8,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateDuration: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  metaSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.TEXT_DISABLED,
    marginHorizontal: 8,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.SUCCESS,
    marginLeft: 4,
    fontWeight: '500',
  },
  expandedContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
  },
  setsContainer: {
    paddingTop: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: COLORS.ERROR,
    marginTop: 8,
  },
});

export default WeekDayCard;
