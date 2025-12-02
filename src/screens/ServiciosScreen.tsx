import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

type Servicio = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string;
};

const servicios: Servicio[] = [
  {
    id: '1',
    title: 'Tienda',
    description: 'Indumentaria oficial, accesorios y productos del club',
    icon: 'storefront-outline',
    screen: 'Tienda',
  },
  {
    id: '2',
    title: 'Mutual',
    description: 'Prestaciones médicas y servicios de salud',
    icon: 'medical-outline',
    screen: 'Mutual',
  },
  {
    id: '3',
    title: 'Villa Mitre Viajes',
    description: 'Agencia de turismo y paquetes de viaje',
    icon: 'airplane-outline',
    screen: 'VillaMitreViajes',
  },
];

export default function ServiciosScreen() {
  const navigation = useNavigation();

  const handleServicioPress = (servicio: Servicio) => {
    if (servicio.screen) {
      // @ts-ignore - Navegación a pantallas específicas
      navigation.navigate(servicio.screen);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Servicios</Text>
      <Text style={styles.subHeaderText}>Accede a todos los servicios exclusivos para socios</Text>

      <View style={styles.serviciosContainer}>
        {servicios.map((servicio) => (
          <TouchableOpacity
            key={servicio.id}
            style={styles.servicioCard}
            onPress={() => handleServicioPress(servicio)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={servicio.icon} size={32} color={COLORS.PRIMARY_GREEN} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.servicioTitle}>{servicio.title}</Text>
              <Text style={styles.servicioDescription}>{servicio.description}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color={COLORS.GRAY_MEDIUM} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GRAY_LIGHTEST,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
    textAlign: 'center',
    marginVertical: 20,
  },
  subHeaderText: {
    fontSize: 16,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  serviciosContainer: {
    paddingBottom: 30,
  },
  servicioCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.GREEN_LIGHTER,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  servicioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_BLACK,
    marginBottom: 4,
  },
  servicioDescription: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
    lineHeight: 18,
  },
});
