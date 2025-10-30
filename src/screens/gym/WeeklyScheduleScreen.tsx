import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { gymService } from '../../services/gymService';
import { useAuth } from '../../hooks/useAuth';
import { WeeklyScheduleResponse, WeekDay } from '../../types/gym';
import { WeekDayCard } from '../../components/gym/WeekDayCard';

const WEEK_DAYS: WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

type WeeklyScheduleParams = {
  preloadedSchedule?: any;
};

type WeeklyScheduleRouteProp = RouteProp<
  { WeeklySchedule: WeeklyScheduleParams },
  'WeeklySchedule'
>;

export default function WeeklyScheduleScreen() {
  const route = useRoute<WeeklyScheduleRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const preloadedSchedule = route.params?.preloadedSchedule;
  
  const [schedule, setSchedule] = useState<WeeklyScheduleResponse['schedule'] | null>(preloadedSchedule || null);
  const [loading, setLoading] = useState(!preloadedSchedule);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!preloadedSchedule) {
      loadSchedule();
    } else {
      console.log('✅ Usando calendario precargado');
    }
  }, [user, preloadedSchedule]);

  const loadSchedule = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      // No pasamos studentId para usar endpoint de estudiante
      const data = await gymService.getWeeklySchedule();
      setSchedule(data);
    } catch (err: any) {
      console.error('Error loading schedule:', err);
      setError(err.message || 'Error al cargar el calendario');
      Alert.alert(
        'Error',
        'No se pudo cargar el calendario semanal. Por favor intenta nuevamente.',
        [
          { text: 'Reintentar', onPress: loadSchedule },
          { text: 'Volver', onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getTodayWeekday = (): WeekDay => {
    const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    return days[today];
  };

  const handleTemplatePress = (templateId: number, templateName: string) => {
    // @ts-ignore
    navigation.navigate('TemplateDetails', {
      templateId,
      templateName,
    });
  };

  const getTotalWorkouts = (): number => {
    if (!schedule) return 0;
    return WEEK_DAYS.reduce((total, day) => {
      return total + (schedule[day]?.length || 0);
    }, 0);
  };

  const getActiveDay = (): string => {
    const today = getTodayWeekday();
    const dayNames: Record<WeekDay, string> = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
    };
    return dayNames[today];
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} />
        <Text style={styles.loadingText}>Cargando calendario...</Text>
      </View>
    );
  }

  // Error State
  if (error || !schedule) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="calendar-outline" size={64} color={COLORS.ERROR} />
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSchedule}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.WHITE} />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const today = getTodayWeekday();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con información */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="calendar" size={32} color={COLORS.PRIMARY_GREEN} />
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mi Calendario Semanal</Text>
          <Text style={styles.subtitle}>
            Entrenamientos programados para esta semana
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="fitness-outline" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.statValue}>{getTotalWorkouts()}</Text>
          <Text style={styles.statLabel}>Entrenamientos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="today-outline" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.statValue}>{getActiveDay()}</Text>
          <Text style={styles.statLabel}>Día Actual</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.statValue}>{schedule[today]?.length || 0}</Text>
          <Text style={styles.statLabel}>Para Hoy</Text>
        </View>
      </View>

      {/* Días de la semana */}
      <View style={styles.daysSection}>
        <View style={styles.daysSectionHeader}>
          <Ionicons name="list-outline" size={20} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.daysSectionTitle}>Entrenamientos por Día</Text>
        </View>

        {WEEK_DAYS.map((day) => (
          <WeekDayCard
            key={day}
            day={day}
            templates={schedule[day] || []}
            isToday={day === today}
            onTemplatePress={handleTemplatePress}
          />
        ))}
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.INFO} />
          <Text style={styles.footerText}>
            Toca en cualquier entrenamiento para ver sus detalles completos.
          </Text>
        </View>

        <View style={styles.footerCard}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.footerText}>
            El calendario se actualiza automáticamente cada semana según tus asignaciones.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.WHITE,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_TERTIARY,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    textAlign: 'center',
  },
  daysSection: {
    padding: 16,
  },
  daysSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY_GREEN,
  },
  daysSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  footerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY_GREEN,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginLeft: 12,
  },
});
