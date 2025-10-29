import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/colors';
import { FloatingChatBot } from '../components/FloatingChatBot';

export default function EstadoDeCuentaScreen() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();

  // Función para determinar el estado basado en semáforo
  const getEstadoFromSemaforo = (semaforo?: number) => {
    if (semaforo === undefined || semaforo === null) {
      return { alDia: false, texto: 'Sin información', color: COLORS.TEXT_SECONDARY };
    }
    
    switch (semaforo) {
      case 1:
        return { alDia: true, texto: 'Al día', color: COLORS.SUCCESS };
      case 99:
        return { alDia: false, texto: 'Con deuda exigible', color: COLORS.ERROR };
      case 10:
        return { alDia: false, texto: 'Con deuda no exigible', color: COLORS.WARNING };
      default:
        return { alDia: false, texto: 'Estado desconocido', color: COLORS.TEXT_SECONDARY };
    }
  };

  const estadoInfo = getEstadoFromSemaforo(user?.semaforo);
  const formatearMonto = (monto?: number) => {
    if (!monto && monto !== 0) return 'N/A';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  const handleMisPuntos = () => {
    // @ts-ignore - Navegación temporal hasta refactorizar
    navigation.navigate('MisPuntos');
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Cargando estado de cuenta...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No se pudo cargar la información del usuario</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Header Principal Mejorado */}
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Ionicons name="card-outline" size={32} color={COLORS.WHITE} />
            <Text style={styles.title}>Estado de Cuenta</Text>
            <Text style={styles.subtitle}>Estado actual de pagos</Text>
          </View>
        </View>

        {/* Indicador de Estado Principal */}
        <View style={[styles.statusCard, { borderLeftColor: estadoInfo.color }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: estadoInfo.color }]}>
              <Text style={styles.statusIcon}>{estadoInfo.alDia ? '✅' : '⚠️'}</Text>
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: estadoInfo.color }]}>
                {estadoInfo.texto}
              </Text>
              <Text style={styles.statusSubtext}>
                {estadoInfo.alDia ? 'Sus pagos están al día' : 'Revisar estado de cuenta'}
              </Text>
            </View>
          </View>
        </View>

        {/* Información de Saldo Mejorada */}
        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.cardTitle}>Saldo Actual</Text>
          </View>
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Saldo de Cuenta</Text>
            <Text style={[styles.balanceAmount, { 
              color: (user?.saldo ?? 0) === 0 ? COLORS.TEXT_PRIMARY : ((user?.saldo ?? 0) > 0 ? COLORS.PRIMARY_GREEN : COLORS.ERROR)
            }]}>
              ${Math.abs(user?.saldo ?? 0).toLocaleString('es-AR')}
            </Text>
            <View style={[styles.balanceIndicator, { 
              backgroundColor: (user?.saldo ?? 0) === 0 ? COLORS.TEXT_PRIMARY : ((user?.saldo ?? 0) > 0 ? COLORS.PRIMARY_GREEN : COLORS.ERROR)
            }]} />
          </View>
        </View>

        {/* Información del Estado de Cuenta */}
        {/* <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.cardTitle}>Detalles de Cuenta</Text>
          </View>
          <View style={styles.paymentInfo}>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Cuotas adeudadas</Text>
              <Text style={[styles.paymentValue, { 
                color: ((user?.estadoCuenta?.cuotasAdeudadas || 0) > 0) ? COLORS.ERROR : COLORS.SUCCESS 
              }]}>
                {user?.estadoCuenta?.cuotasAdeudadas || 0}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Monto adeudado</Text>
              <Text style={[styles.paymentValue, { 
                color: ((user?.estadoCuenta?.montoAdeudado || 0) > 0) ? COLORS.ERROR : COLORS.SUCCESS 
              }]}>
                {formatearMonto(user?.estadoCuenta?.montoAdeudado)}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Próximo vencimiento</Text>
              <Text style={styles.paymentValue}>
                {user?.estadoCuenta?.proximoVencimiento || 'Sin información'}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Último pago</Text>
              <Text style={styles.paymentValue}>
                {user?.estadoCuenta?.ultimoPago || 'Sin información'}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Monto último pago</Text>
              <Text style={[styles.paymentValue, { color: COLORS.SUCCESS }]}>
                {formatearMonto(user?.estadoCuenta?.montoUltimoPago)}
              </Text>
            </View>

          </View>
        </View> */}

        {/* Historial de Pagos */}
        {/* <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.cardTitle}>Historial de Pagos</Text>
          </View>
          {user?.estadoCuenta?.historialPagos && user.estadoCuenta.historialPagos.length > 0 ? (
            user.estadoCuenta.historialPagos.map((pago, index) => (
              <View key={pago.id || index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{pago.fecha}</Text>
                  <Text style={styles.historyAmount}>
                    {formatearMonto(pago.monto)}
                  </Text>
                </View>
                <Text style={styles.historyDescription}>{pago.concepto}</Text>
                <Text style={styles.historyMethod}>{pago.metodoPago}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.paymentLabel}>No hay historial de pagos disponible</Text>
          )}
        </View> */}

      </ScrollView>
      <FloatingChatBot />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.ERROR,
    textAlign: 'center',
  },

  // Header Mejorado
  headerGradient: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'BarlowCondensed-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
  },

  // Status Card
  statusCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  debtInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_LIGHT,
  },
  debtAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ERROR,
    marginBottom: 4,
  },
  debtDue: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },

  // Cards Mejoradas
  balanceCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY_GREEN,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
    fontFamily: 'BarlowCondensed-Bold',
  },
  balanceContent: {
    alignItems: 'center',
    position: 'relative',
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'BarlowCondensed-Bold',
  },
  balanceIndicator: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  // Payment Info
  paymentInfo: {
    gap: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 12,
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'right',
  },

  // History Mejorado
  historyItem: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY_GREEN,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
    fontFamily: 'BarlowCondensed-Bold',
  },
  historyDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    lineHeight: 20,
  },
  historyMethod: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
    fontStyle: 'italic',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  // Actions
  actionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: COLORS.WARNING,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    textAlign: 'center',
  },
});
