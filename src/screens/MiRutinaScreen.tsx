import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FloatingChatBot } from '../components/FloatingChatBot';

export default function MiRutinaScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Rutina</Text>
          <Text style={styles.subtitle}>Plan de entrenamiento personalizado</Text>
        </View>

        {/* Estado de la rutina */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="fitness" size={32} color={COLORS.PRIMARY_GREEN} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Rutina Activa</Text>
              <Text style={styles.statusSubtitle}>Programa de fuerza - Nivel intermedio</Text>
            </View>
          </View>
        </View>

        {/* Progreso semanal */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Progreso de la Semana</Text>
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Entrenamientos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Restantes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>75%</Text>
              <Text style={styles.statLabel}>Completado</Text>
            </View>
          </View>
        </View>

        {/* Entrenamientos de la semana */}
        <View style={styles.workoutsCard}>
          <Text style={styles.cardTitle}>Entrenamientos de la Semana</Text>

          <View style={styles.workoutItem}>
            <View style={styles.workoutDay}>
              <Text style={styles.dayText}>LUN</Text>
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>Tren Superior</Text>
              <Text style={styles.workoutDetails}>45 min • Completado</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.SUCCESS} />
          </View>

          <View style={styles.workoutItem}>
            <View style={styles.workoutDay}>
              <Text style={styles.dayText}>MIE</Text>
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>Tren Inferior</Text>
              <Text style={styles.workoutDetails}>50 min • Completado</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.SUCCESS} />
          </View>

          <View style={styles.workoutItem}>
            <View style={styles.workoutDay}>
              <Text style={styles.dayText}>VIE</Text>
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>Cardio + Core</Text>
              <Text style={styles.workoutDetails}>35 min • Completado</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.SUCCESS} />
          </View>

          <View style={styles.workoutItem}>
            <View style={[styles.workoutDay, styles.workoutDayPending]}>
              <Text style={[styles.dayText, styles.dayTextPending]}>SAB</Text>
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>Funcional</Text>
              <Text style={styles.workoutDetails}>40 min • Pendiente</Text>
            </View>
            <Ionicons name="time-outline" size={24} color={COLORS.TEXT_SECONDARY} />
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="play" size={20} color={COLORS.WHITE} />
            <Text style={styles.primaryButtonText}>Iniciar Entrenamiento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.secondaryButtonText}>Ver Calendario</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Próxima Evaluación</Text>
          <Text style={styles.infoText}>
            Tu próxima evaluación física está programada para el 25 de enero. Nuestros profesores
            analizarán tu progreso y ajustarán tu rutina según tus objetivos.
          </Text>
        </View>
      </ScrollView>

      <FloatingChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: 'BarlowCondensed-Bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: 'BarlowCondensed-Bold',
  },
  statusSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: 'BarlowCondensed-Bold',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
    fontFamily: 'BarlowCondensed-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.BORDER_LIGHT,
  },
  workoutsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  workoutDay: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutDayPending: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontFamily: 'BarlowCondensed-Bold',
  },
  dayTextPending: {
    color: COLORS.TEXT_SECONDARY,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  workoutDetails: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.SHADOW_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'BarlowCondensed-Bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_GREEN,
  },
  secondaryButtonText: {
    color: COLORS.PRIMARY_GREEN,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'BarlowCondensed-Bold',
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    shadowColor: COLORS.SHADOW_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    fontFamily: 'BarlowCondensed-Bold',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
});
