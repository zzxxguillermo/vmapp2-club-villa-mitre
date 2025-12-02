import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FloatingChatBot } from '../components/FloatingChatBot';
import { COLORS } from '../constants/colors';

export default function MisPuntosScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const [puntosTotales, setPuntosTotales] = useState(1200);
  const [puntosObtenidos, setPuntosObtenidos] = useState(1800);
  const [puntosGastados, setPuntosGastados] = useState(600);
  const [puntosDisponibles, setPuntosDisponibles] = useState(puntosTotales);

  // Datos más realistas y detallados para el gráfico circular
  const pieData = [
    {
      name: 'Disponibles',
      population: puntosDisponibles,
      color: COLORS.PRIMARY_GREEN,
      legendFontColor: COLORS.TEXT_PRIMARY,
      legendFontSize: 16,
    },
    {
      name: 'Gastados',
      population: puntosGastados,
      color: COLORS.WARNING,
      legendFontColor: COLORS.TEXT_PRIMARY,
      legendFontSize: 16,
    },
    {
      name: 'Por Vencer',
      population: 200,
      color: COLORS.ERROR,
      legendFontColor: COLORS.TEXT_PRIMARY,
      legendFontSize: 16,
    },
  ];

  // Datos más detallados para el gráfico de barras (últimos 12 meses)
  const barData = {
    labels: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        data: [150, 280, 320, 180, 450, 380, 200, 300, 250, 400, 350, 300],
        color: (opacity = 1) => `rgba(0, 151, 61, ${opacity})`, // Verde del club
        strokeWidth: 3,
      },
    ],
  };

  // Datos para gráfico de líneas (tendencia de puntos acumulados)
  const lineData = {
    labels: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        data: [800, 920, 1100, 980, 1200, 1350, 1200, 1300, 1250, 1400, 1350, 1200],
        color: (opacity = 1) => `rgba(0, 151, 61, ${opacity})`,
        strokeWidth: 4,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header con imagen */}
        <View style={styles.headerSection}>
          <Image
            source={{ uri: 'https://picsum.photos/id/1060/800/400' }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>MIS PUNTOS</Text>
            <Text style={styles.headerSubtitle}>Gestiona y canjea tus puntos del club</Text>
          </View>
        </View>

        {/* Resumen de puntos */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="star" size={28} color={COLORS.PRIMARY_GREEN} />
              <Text style={styles.summaryTitle}>Puntos Disponibles</Text>
            </View>
            <Text style={styles.summaryPoints}>{puntosTotales}</Text>
            <Text style={styles.summaryLabel}>puntos acumulados</Text>
          </View>
        </View>

        {/* Gráfico circular */}
        <View style={styles.chartSection}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Distribución de Puntos</Text>
            <PieChart
              data={pieData}
              width={width * 0.85}
              height={220}
              chartConfig={chartConfig}
              accessor={'population'}
              backgroundColor={'transparent'}
              paddingLeft={'15'}
              absolute
            />
          </View>
        </View>

        {/* Gráfico de barras - Puntos ganados por mes */}
        <View style={styles.chartSection}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Puntos Ganados por Mes</Text>
            <Text style={styles.chartSubtitle}>Últimos 12 meses</Text>
            <BarChart
              data={barData}
              width={width * 0.85}
              height={240}
              chartConfig={enhancedChartConfig}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=" pts"
              style={{ borderRadius: 12, marginTop: 10 }}
            />
          </View>
        </View>

        {/* Gráfico de líneas - Tendencia de puntos acumulados */}
        <View style={styles.chartSection}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Evolución de Puntos Totales</Text>
            <Text style={styles.chartSubtitle}>Tendencia de acumulación</Text>
            <LineChart
              data={lineData}
              width={width * 0.85}
              height={240}
              chartConfig={enhancedChartConfig}
              bezier
              style={{ borderRadius: 12, marginTop: 10 }}
              decorator={() => null}
              onDataPointClick={(data) => {
                // Opcional: mostrar detalles del punto
              }}
            />
          </View>
        </View>

        {/* Estadísticas adicionales */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Estadísticas del Mes</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color={COLORS.PRIMARY_GREEN} />
              <Text style={styles.statNumber}>+300</Text>
              <Text style={styles.statLabel}>Puntos ganados</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color={COLORS.INFO} />
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Días activos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color={COLORS.WARNING} />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Logros nuevos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={COLORS.ERROR} />
              <Text style={styles.statNumber}>200</Text>
              <Text style={styles.statLabel}>Por vencer</Text>
            </View>
          </View>
        </View>

        {/* Opciones de uso */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>¿Qué hacer con mis puntos?</Text>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="gift-outline" size={28} color={COLORS.WHITE} />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Canjear Beneficios</Text>
                <Text style={styles.actionButtonSubtitle}>Descuentos y promociones exclusivas</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.INFO }]}
            onPress={() => (navigation as any).navigate('MisBeneficios')}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="card-outline" size={28} color={COLORS.WHITE} />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Descuentos en Compras</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Usa tus puntos en la tienda del club
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.WARNING }]}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="analytics-outline" size={28} color={COLORS.WHITE} />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Ver Más Detalles</Text>
                <Text style={styles.actionButtonSubtitle}>Historial completo y estadísticas</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ChatBot flotante */}
      <FloatingChatBot />
    </View>
  );
}

const chartConfig = {
  backgroundColor: COLORS.WHITE,
  backgroundGradientFrom: COLORS.WHITE,
  backgroundGradientTo: COLORS.WHITE,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const enhancedChartConfig = {
  backgroundColor: COLORS.WHITE,
  backgroundGradientFrom: COLORS.WHITE,
  backgroundGradientTo: COLORS.WHITE,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 151, 61, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(29, 29, 27, ${opacity})`,
  strokeWidth: 3,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
  propsForDots: {
    r: '6',
    strokeWidth: '3',
    stroke: COLORS.PRIMARY_GREEN,
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: COLORS.GRAY_LIGHT,
    strokeWidth: 1,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  scrollContainer: {
    flex: 1,
  },
  // Header Section
  headerSection: {
    position: 'relative',
    height: 200,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'BarlowCondensed-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    textAlign: 'center',
    opacity: 0.9,
  },
  // Summary Section
  summarySection: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.PRIMARY_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
    fontFamily: 'BarlowCondensed-Bold',
  },
  summaryPoints: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'BarlowCondensed-Bold',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  // Chart Section
  chartSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chartCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.PRIMARY_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: 'BarlowCondensed-Bold',
  },
  // Actions Section
  actionsSection: {
    padding: 20,
  },
  actionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: 'BarlowCondensed-Bold',
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: COLORS.PRIMARY_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  actionButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 4,
    fontFamily: 'BarlowCondensed-Bold',
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  // Chart Subtitle
  chartSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  // Stats Section
  statsSection: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: 'BarlowCondensed-Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY_BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'BarlowCondensed-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
