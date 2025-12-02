import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { useGymAssignments } from '../hooks/useGymAssignments';
import { TemplateWithDetails } from '../../../types/gym';
import { GymHeader } from '../components/GymHeader';
import { TodayWorkout } from '../components/TodayWorkout';
import { AssignmentsList } from '../components/AssignmentsList';

export default function GimnasioScreen() {
  const navigation = useNavigation();
  const { assignments, loading, isAutoRefreshing } = useGymAssignments();

  const handleAssignmentPress = (assignment: TemplateWithDetails) => {
    // @ts-ignore
    navigation.navigate('TemplateDetails', {
      templateId: assignment.id,
      templateName: assignment.template_name,
      preloadedTemplate: assignment.detailsLoaded ? assignment.fullTemplate : null,
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Button - Header fijo */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
        <GymHeader
          title="MIS ENTRENAMIENTOS"
          subtitle={
            assignments.length > 0
              ? `${assignments.length} rutina${assignments.length !== 1 ? 's' : ''} asignada${assignments.length !== 1 ? 's' : ''}`
              : 'Sin rutinas asignadas'
          }
        />

        <TodayWorkout assignments={assignments} loading={loading} onPress={handleAssignmentPress} />

        <AssignmentsList
          assignments={assignments}
          loading={loading}
          onPress={handleAssignmentPress}
        />

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
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#F0FFF4',
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.PRIMARY_GREEN,
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
    marginBottom: 20,
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
});
