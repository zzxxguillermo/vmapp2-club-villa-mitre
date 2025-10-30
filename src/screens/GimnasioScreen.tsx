import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/colors';
import { gymService } from '../services/gymService';
import { Assignment, DailyTemplate } from '../types/gym';

interface TemplateWithDetails extends Assignment {
  detailsLoaded?: boolean;
  fullTemplate?: DailyTemplate;
}

export default function GimnasioScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<TemplateWithDetails[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const lastRefreshTime = useRef<number>(Date.now());

  useFocusEffect(
    useCallback(() => {
      if (user) {
        refreshData(true);
        
        const interval = setInterval(() => {
          refreshData(false);
        }, 60000);
        
        return () => clearInterval(interval);
      }
    }, [user])
  );

  const refreshData = async (isManual = false) => {
    const now = Date.now();
    if (!isManual && (now - lastRefreshTime.current < 60000)) {
      return;
    }
    
    try {
      setIsAutoRefreshing(!isManual);
      await loadAllData();
      lastRefreshTime.current = now;
    } catch (error) {
      if (__DEV__) console.log('⚠️ Auto-refresh falló:', error);
    } finally {
      setIsAutoRefreshing(false);
    }
  };

  const loadAllData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🏋️ Cargando datos completos del gimnasio...');
      
      // 1. Cargar rutinas asignadas
      const userAssignments = await gymService.getMyTemplates();
      const activeAssignments = userAssignments.filter(a => a.is_active);
      setAssignments(activeAssignments);
      
      // 2. Cargar calendario semanal en paralelo
      const schedulePromise = gymService.getWeeklySchedule().catch(err => {
        console.log('⚠️ Error al cargar calendario, continuando sin él:', err);
        return null;
      });
      
      // 3. Cargar detalles de cada rutina en paralelo
      setLoadingDetails(true);
      const detailsPromises = activeAssignments.map(async (assignment) => {
        try {
          const details = await gymService.getTemplateDetails(assignment.id);
          return { ...assignment, detailsLoaded: true, fullTemplate: details };
        } catch (error) {
          console.log(`⚠️ Error al cargar detalles de rutina ${assignment.id}:`, error);
          return { ...assignment, detailsLoaded: false };
        }
      });
      
      // Esperar a que todas las peticiones terminen
      const [schedule, ...assignmentsWithDetails] = await Promise.all([
        schedulePromise,
        ...detailsPromises
      ]);
      
      setWeeklySchedule(schedule);
      setAssignments(assignmentsWithDetails as TemplateWithDetails[]);
      setLoadingDetails(false);
      
      console.log('✅ Datos completos cargados:', {
        rutinas: assignmentsWithDetails.length,
        calendario: schedule ? 'Cargado' : 'No disponible',
        detallesCargados: assignmentsWithDetails.filter((a: any) => a.detailsLoaded).length
      });
      
    } catch (error) {
      console.error('Error loading gym data:', error);
      // Silently fail - show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentPress = (assignment: TemplateWithDetails) => {
    // Si ya tenemos los detalles cargados, pasarlos también
    // @ts-ignore
    navigation.navigate('TemplateDetails', { 
      templateId: assignment.id,
      templateName: assignment.template_name,
      preloadedTemplate: assignment.detailsLoaded ? assignment.fullTemplate : null
    });
  };

  const getTodayAssignments = () => {
    const today = gymService.getTodayWeekday();
    const todayAssignments = assignments.filter(a => a.assigned_days.includes(today));
    
    if (__DEV__) {
      console.log('📅 Día de hoy (0=Dom, 6=Sab):', today);
      console.log('📋 Total assignments:', assignments.length);
      console.log('🏋️ Entrenamientos para hoy:', todayAssignments.length);
      assignments.forEach(a => {
        console.log(`  - ${a.template_name}: días asignados [${a.assigned_days.join(', ')}]`);
      });
    }
    
    return todayAssignments;
  };

  return (
    <View style={styles.container}>
      {/* Back Button - Header fijo */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {isAutoRefreshing && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.refreshText}>Actualizando...</Text>
        </View>
      )}

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header con imagen del gimnasio */}
        <View style={styles.headerSection}>
          <Image
            source={{ uri: 'https://picsum.photos/id/1841/800/400' }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>MIS ENTRENAMIENTOS</Text>
            <Text style={styles.headerSubtitle}>
              {assignments.length > 0 ? `${assignments.length} rutina${assignments.length !== 1 ? 's' : ''} asignada${assignments.length !== 1 ? 's' : ''}` : 'Sin rutinas asignadas'}
            </Text>
          </View>
        </View>

        {/* Entrenamiento de Hoy - PRIMER PLANO */}
        {!loading && (
          <View style={styles.todaySection}>
            <View style={styles.todaySectionHeader}>
              <View style={styles.todayBadge}>
                <Ionicons name="today" size={18} color={COLORS.WHITE} />
                <Text style={styles.todayBadgeText}>HOY</Text>
              </View>
              <Text style={styles.todaySectionTitle}>
                {getTodayAssignments().length > 0 ? 'Tu Entrenamiento' : 'Día de Descanso'}
              </Text>
            </View>
            
            {getTodayAssignments().length === 0 && (
              <View style={styles.restDayCard}>
                <Ionicons name="bed-outline" size={48} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.restDayTitle}>Hoy es día de descanso</Text>
                <Text style={styles.restDayText}>
                  Aprovecha para recuperarte. Tus próximos entrenamientos están en el calendario.
                </Text>
              </View>
            )}
            
            {getTodayAssignments().length > 0 && (
              <View style={styles.todayWorkoutContainer}>
            
            {getTodayAssignments().map((assignment) => {
              const template = assignment.fullTemplate || assignment.template;
              const sets = template?.sets || [];
              const totalExercises = sets.reduce((acc, set) => acc + (set.exercises?.length || 0), 0);
              
              return (
                <TouchableOpacity 
                  key={assignment.id}
                  style={styles.todayWorkoutCard}
                  onPress={() => handleAssignmentPress(assignment)}
                  activeOpacity={0.9}
                >
                  {/* Header con nombre y nivel */}
                  <View style={styles.todayWorkoutHeader}>
                    <Text style={styles.todayWorkoutTitle}>{assignment.template_name}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>
                        {gymService.getDifficultyLabel(assignment.template.difficulty_level).toUpperCase()}
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
        )}

        {/* Botón Calendario Semanal - OCULTO TEMPORALMENTE */}
        {/* <View style={styles.calendarButtonContainer}>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('WeeklySchedule', {
                preloadedSchedule: weeklySchedule
              });
            }}
          >
            <View style={styles.calendarButtonIcon}>
              <Ionicons name="calendar" size={24} color={COLORS.PRIMARY_GREEN} />
            </View>
            <View style={styles.calendarButtonContent}>
              <Text style={styles.calendarButtonTitle}>Calendario Semanal</Text>
              <Text style={styles.calendarButtonSubtitle}>Ver entrenamientos por día</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.PRIMARY_GREEN} />
          </TouchableOpacity>
        </View> */}

        {/* Mis Plantillas Asignadas */}
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
                    onPress={() => handleAssignmentPress(assignment)}
                  >
                    <View style={styles.assignmentHeader}>
                      <View style={styles.assignmentIcon}>
                        <Ionicons name="fitness" size={20} color={COLORS.PRIMARY_GREEN} />
                      </View>
                      <View style={styles.assignmentInfo}>
                        <Text style={styles.assignmentName}>{assignment.template_name}</Text>
                        <Text style={styles.assignmentMeta}>
                          {gymService.formatDuration(assignment.template.estimated_duration_minutes)} • {gymService.getDifficultyLabel(assignment.template.difficulty_level)}
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
                            getTodayAssignments().some(a => a.id === assignment.id) && day === gymService.getTodayWeekday() && styles.dayBadgeActive
                          ]}
                        >
                          <Text style={[
                            styles.dayBadgeText,
                            getTodayAssignments().some(a => a.id === assignment.id) && day === gymService.getTodayWeekday() && styles.dayBadgeActiveText
                          ]}>
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


          {/* Servicios adicionales */}
          <View style={styles.servicesSection}>
            <Text style={styles.servicesTitle}>Servicios Disponibles</Text>
            <View style={styles.servicesList}>
              <View style={styles.serviceItem}>
                <Ionicons name="water-outline" size={20} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.serviceText}>Vestuarios con duchas</Text>
              </View>
              <View style={styles.serviceItem}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.serviceText}>Casilleros seguros</Text>
              </View>
              <View style={styles.serviceItem}>
                <Ionicons name="thermometer-outline" size={20} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.serviceText}>Aire acondicionado</Text>
              </View>
              <View style={styles.serviceItem}>
                <Ionicons name="wifi-outline" size={20} color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.serviceText}>WiFi gratuito</Text>
              </View>
            </View>
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  backButtonContainer: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRIMARY_GREEN,
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  headerSection: {
    position: 'relative',
    height: 200,
    marginBottom: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontFamily: 'BarlowCondensed-Bold',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    marginTop: 4,
    opacity: 0.9,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
    fontFamily: 'BarlowCondensed-Bold',
  },
  infoDescription: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 24,
  },
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 10,
    fontFamily: 'BarlowCondensed-Bold',
  },
  scheduleContent: {
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scheduleDay: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: 16,
    color: COLORS.PRIMARY_GREEN,
    fontWeight: 'bold',
  },
  rutinaButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: COLORS.SHADOW_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  rutinaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  rutinaButtonText: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  rutinaButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontFamily: 'BarlowCondensed-Bold',
    letterSpacing: 1,
  },
  rutinaButtonSubtitle: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginTop: 2,
  },
  servicesSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: 'BarlowCondensed-Bold',
  },
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 12,
  },
  quickActionsSection: {
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
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: 'BarlowCondensed-Bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 16,
  },
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
  dayBadgeTextActive: {
    color: COLORS.WHITE,
  },
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
    // Container vacío, los estilos están en todayWorkoutCard
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
    paddingBottom: 16,
  },
  todayWorkoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontFamily: 'BarlowCondensed-Bold',
    flex: 1,
    marginRight: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontFamily: 'BarlowCondensed-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  todayWorkoutCTA: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    gap: 12,
  },
  todayWorkoutCTAText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    letterSpacing: 1,
    fontFamily: 'BarlowCondensed-Bold',
  },
  calendarButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY_GREEN,
  },
  calendarButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  calendarButtonContent: {
    flex: 1,
  },
  calendarButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  calendarButtonSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  calendarButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.PRIMARY_GREEN + '15',
    gap: 8,
  },
  refreshText: {
    fontSize: 12,
    color: COLORS.PRIMARY_GREEN,
    fontWeight: '600',
  },
});
