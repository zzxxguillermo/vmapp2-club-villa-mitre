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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { gymService } from '../../services/gymService';
import { DailyTemplate } from '../../types/gym';
import { SetCard } from '../../components/gym/SetCard';
import { DifficultyBadge } from '../../components/gym/DifficultyBadge';

type TemplateDetailParams = {
  templateId: number;
  templateName: string;
  preloadedTemplate?: DailyTemplate | null;
};

type TemplateDetailRouteProp = RouteProp<
  { TemplateDetails: TemplateDetailParams },
  'TemplateDetails'
>;

export default function TemplateDetailScreen() {
  const route = useRoute<TemplateDetailRouteProp>();
  const navigation = useNavigation();
  const { templateId, templateName, preloadedTemplate } = route.params;

  const [template, setTemplate] = useState<DailyTemplate | null>(preloadedTemplate || null);
  const [loading, setLoading] = useState(!preloadedTemplate);
  const [error, setError] = useState<string | null>(null);
  const [expandedSets, setExpandedSets] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Solo cargar si no tenemos datos precargados
    if (!preloadedTemplate) {
      loadTemplate();
    } else {
      console.log('✅ Usando datos precargados de rutina');
      // Expandir primer set por defecto
      if (preloadedTemplate.sets.length > 0) {
        setExpandedSets({ [preloadedTemplate.sets[0].id]: true });
      }
    }
  }, [templateId, preloadedTemplate]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gymService.getTemplateDetails(templateId);
      setTemplate(data);
      
      // Expand first set by default
      if (data.sets.length > 0) {
        setExpandedSets({ [data.sets[0].id]: true });
      }
    } catch (err: any) {
      console.error('Error loading template:', err);
      setError(err.message || 'Error al cargar la rutina');
      Alert.alert(
        'Error',
        'No se pudo cargar el detalle de la rutina. Por favor intenta nuevamente.',
        [
          { text: 'Reintentar', onPress: loadTemplate },
          { text: 'Volver', onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSet = (setId: number) => {
    setExpandedSets((prev) => ({
      ...prev,
      [setId]: !prev[setId],
    }));
  };

  const getTotalExercises = (): number => {
    return template?.sets.reduce((sum, set) => sum + set.exercises.length, 0) || 0;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} />
        <Text style={styles.loadingText}>Cargando rutina...</Text>
        <Text style={styles.loadingSubtext}>{templateName}</Text>
      </View>
    );
  }

  // Error State
  if (error || !template) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.ERROR} />
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTemplate}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.WHITE} />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header de Información General */}
        <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}>
            <Ionicons name="barbell" size={32} color={COLORS.PRIMARY_GREEN} />
          </View>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>{template.name}</Text>
            {template.description && (
              <Text style={styles.description}>{template.description}</Text>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.statValue}>{formatDuration(template.estimated_duration_minutes)}</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="layers-outline" size={24} color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.statValue}>{template.sets.length}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="fitness-outline" size={24} color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.statValue}>{getTotalExercises()}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>
        </View>

        {/* Difficulty Badge */}
        <View style={styles.difficultyContainer}>
          <DifficultyBadge level={template.difficulty_level} size="large" showIcon={true} />
        </View>
      </View>

      {/* Sets Section */}
      <View style={styles.setsSection}>
        <View style={styles.setsSectionHeader}>
          <Ionicons name="list-outline" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.setsSectionTitle}>Estructura del Entrenamiento</Text>
        </View>

        {/* Empty state (no debería pasar) */}
        {template.sets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={48} color={COLORS.TEXT_DISABLED} />
            <Text style={styles.emptyStateText}>
              Esta rutina no tiene sets configurados
            </Text>
          </View>
        ) : (
          <View style={styles.setsList}>
            {template.sets
              .sort((a, b) => a.order - b.order)
              .map((set, index) => (
                <SetCard
                  key={set.id}
                  set={set}
                  index={index}
                  expanded={expandedSets[set.id] || false}
                  onToggle={() => toggleSet(set.id)}
                />
              ))}
          </View>
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.INFO} />
          <Text style={styles.footerText}>
            Toca en cada ejercicio para ver instrucciones detalladas, videos y más información.
          </Text>
        </View>

        <View style={styles.footerCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.SUCCESS} />
          <Text style={styles.footerText}>
            Recuerda calentar antes de comenzar y consulta con tu profesor ante cualquier duda.
          </Text>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  backButtonContainer: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
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
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 20,
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
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  difficultyContainer: {
    alignItems: 'center',
  },
  setsSection: {
    padding: 16,
  },
  setsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY_GREEN,
  },
  setsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  setsList: {
    // Container for sets
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
    textAlign: 'center',
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
