import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FloatingChatBot } from '../components/FloatingChatBot';
import { useAuth } from '../features/auth/hooks/useAuth';
import { COLORS } from '../constants/colors';

type SubItem = { text: string };

type SubSection = {
  title: string;
  description?: string;
  bullets?: SubItem[];
};

type CentroDeportivoOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string;
  sections?: SubSection[];
};

const centroDeportivoOptions: CentroDeportivoOption[] = [
  {
    id: '1',
    title: 'Natatorio',
    description: 'Horarios, clases de natación y actividades acuáticas',
    icon: 'water-outline',
    screen: 'Natatorio',
    sections: [
      {
        title: 'Información',
        description: 'Espacio destinado a clases y actividades acuáticas del club.',
        bullets: [
          { text: 'Horarios y turnos organizados por niveles' },
          { text: 'Clases grupales e individuales' },
          { text: 'Actividades acuáticas recreativas' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Gimnasio',
    description: 'Equipamiento, rutinas y entrenamiento personalizado',
    icon: 'fitness-outline',
    screen: 'Gimnasio',
    sections: [
      {
        title: 'Información',
        description: 'Sala equipada para entrenamiento de fuerza y acondicionamiento.',
        bullets: [
          { text: 'Circuitos de musculación y cardio' },
          { text: 'Rutinas orientadas a objetivos' },
          { text: 'Acompañamiento y seguimiento dentro de la app' },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Consultorios Médicos',
    description: 'Atención médica deportiva y rehabilitación',
    icon: 'medical-outline',
    screen: 'ConsultoriosMedicos',
    sections: [
      {
        title: 'Servicios',
        description: 'Orientados a la evaluación y cuidado de la salud deportiva.',
        bullets: [
          { text: 'Evaluación médica deportiva' },
          { text: 'Orientación para rehabilitación' },
          { text: 'Derivación a profesionales del club' },
        ],
      },
    ],
  },
];

export default function CentroDeportivoScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleOptionPress = (option: CentroDeportivoOption) => {
    if (__DEV__) {
      console.log('🏋️ Centro Deportivo - Usuario:', user?.user_type);
      console.log('🏋️ Centro Deportivo - Opción:', option.screen);
    }

    // restricción de acceso a Gimnasio para usuarios "local"
    if (option.screen === 'Gimnasio' && user?.user_type === 'local') {
      Alert.alert(
        'Acceso Restringido',
        'Para acceder al gimnasio necesitas ser socio del club. Contactá a administración para más información.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    // si hay pantalla configurada, navega; sino, expande
    if (option.screen) {
      // @ts-ignore - depende de tu tipado de rutas
      navigation.navigate(option.screen);
    } else {
      setExpanded((prev) => ({ ...prev, [option.id]: !prev[option.id] }));
    }
  };

  // permitir expandir sin navegar manteniendo la navegación disponible
  const toggleExpand = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.headerText}>Centro Deportivo</Text>
        <Text style={styles.subHeaderText}>
          Accedé a todas las instalaciones y servicios deportivos del club
        </Text>

        <View style={styles.optionsContainer}>
          {centroDeportivoOptions.map((option) => {
            const isOpen = !!expanded[option.id];
            return (
              <View key={option.id} style={styles.cardWrapper}>
                {/* encabezado de la tarjeta */}
                <TouchableOpacity
                  style={styles.optionCard}
                  activeOpacity={0.9}
                  onPress={() => handleOptionPress(option)}
                  onLongPress={() => toggleExpand(option.id)} // long-press para expandir sin navegar
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={option.icon} size={32} color={COLORS.PRIMARY_GREEN} />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleExpand(option.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                      size={22}
                      color={COLORS.GRAY_MEDIUM}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* detalle expandible */}
                {isOpen && option.sections?.length ? (
                  <View style={styles.detailBox}>
                    {option.sections.map((sec, idx) => (
                      <View key={`${option.id}-sec-${idx}`} style={styles.sectionBlock}>
                        <Text style={styles.sectionTitle}>{sec.title}</Text>
                        {sec.description ? (
                          <Text style={styles.sectionDesc}>{sec.description}</Text>
                        ) : null}

                        {sec.bullets?.length ? (
                          <View style={styles.itemsList}>
                            {sec.bullets.map((b, i) => (
                              <View key={i} style={styles.itemRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.itemText}>{b.text}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
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
  cardWrapper: {
    marginBottom: 14,
  },
  optionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
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
  detailBox: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: -10,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  sectionBlock: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRIMARY_BLACK,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 6,
    lineHeight: 20,
  },
  itemsList: {
    marginTop: 4,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    color: COLORS.PRIMARY_GREEN,
    fontSize: 16,
    lineHeight: 20,
  },
  itemText: {
    flex: 1,
    color: COLORS.PRIMARY_BLACK,
    fontSize: 14,
    lineHeight: 20,
  },
});
