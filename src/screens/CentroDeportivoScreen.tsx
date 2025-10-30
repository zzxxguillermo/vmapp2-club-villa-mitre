import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FloatingChatBot } from '../components/FloatingChatBot';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/colors';

type CentroDeportivoOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string;
};

const centroDeportivoOptions: CentroDeportivoOption[] = [
  {
    id: '1',
    title: 'Natatorio',
    description: 'Horarios, clases de natación y actividades acuáticas',
    icon: 'water-outline',
    screen: 'Natatorio'
  },
  {
    id: '2',
    title: 'Gimnasio',
    description: 'Equipamiento, rutinas y entrenamiento personalizado',
    icon: 'fitness-outline',
    screen: 'Gimnasio'
  },
  {
    id: '3',
    title: 'Consultorios Médicos',
    description: 'Atención médica deportiva y rehabilitación',
    icon: 'medical-outline',
    screen: 'ConsultoriosMedicos'
  },
];

export default function CentroDeportivoScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleOptionPress = (option: CentroDeportivoOption) => {
    // Debug para verificar el tipo de usuario
    if (__DEV__) {
      console.log('🏋️ Centro Deportivo - Usuario:', user?.user_type);
      console.log('🏋️ Centro Deportivo - Opción:', option.screen);
    }

    // Verificar si es el gimnasio y el usuario es local
    if (option.screen === 'Gimnasio' && user?.user_type === 'local') {
      Alert.alert(
        'Acceso Restringido',
        'Para acceder al gimnasio necesitas ser socio del club. Contacta con administración para más información.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    if (option.screen) {
      // @ts-ignore - Navegación a pantallas específicas
      navigation.navigate(option.screen);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.headerText}>Centro Deportivo</Text>
        <Text style={styles.subHeaderText}>
          Accede a todas las instalaciones y servicios deportivos del club
        </Text>
        
        <View style={styles.optionsContainer}>
          {centroDeportivoOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleOptionPress(option)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={option.icon} size={32} color={COLORS.PRIMARY_GREEN} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color={COLORS.GRAY_MEDIUM} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* ChatBot flotante */}
      <FloatingChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
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
  optionsContainer: {
    paddingBottom: 30,
  },
  optionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_BLACK,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.GRAY_MEDIUM,
    lineHeight: 18,
  },
});
