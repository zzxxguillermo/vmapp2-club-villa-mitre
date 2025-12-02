import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FloatingChatBot } from '../components/FloatingChatBot';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useQRGenerator } from '../features/beneficios/hooks/useQRGenerator';
import { QRDisplay } from '../features/beneficios/components/QRDisplay';
import { QRTimer } from '../features/beneficios/components/QRTimer';
import { QRInstructions } from '../features/beneficios/components/QRInstructions';
import { Beneficio } from '../features/beneficios/types';

type RouteParams = { beneficio: Beneficio };

const useUserIdentity = () => {
  const dni = '30123456';
  const externalUserId = undefined as string | undefined;
  return { dni, externalUserId };
};

export default function QRBeneficioScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const params = (route?.params ?? {}) as Partial<RouteParams>;
  const beneficio = params?.beneficio as Beneficio | undefined;

  const { user } = useAuth();
  const apiUserId = Number(user?.id);
  const { dni, externalUserId } = useUserIdentity();

  const { qrValue, timeRemaining, isLoading, error, refresh } = useQRGenerator({
    beneficio,
    userId: apiUserId,
    dni,
    externalUserId,
  });

  const goBack = () => navigation.goBack();

  if (!beneficio?.id) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: COLORS.TEXT_PRIMARY, marginBottom: 12 }}>
          No se recibieron los datos del beneficio.
        </Text>
        <TouchableOpacity onPress={goBack} style={{ padding: 10 }}>
          <Text style={{ color: COLORS.PRIMARY_GREEN, fontWeight: '600' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Código QR</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Beneficio Info */}
        <View style={styles.beneficioInfo}>
          {!!beneficio.categoria && (
            <View style={styles.categoriaTag}>
              <Text style={styles.categoriaText}>{beneficio.categoria}</Text>
            </View>
          )}
          <Text style={styles.comercioName}>{beneficio.comercio}</Text>
          <Text style={styles.descuentoText}>{beneficio.descuento}</Text>
        </View>

        {/* QR Display */}
        <QRDisplay qrValue={qrValue} isLoading={isLoading} error={error} />

        {/* Timer + Refresh */}
        <View style={styles.timerWrapper}>
          <QRTimer timeRemaining={timeRemaining} onRefresh={refresh} />
        </View>

        {/* Instrucciones */}
        <QRInstructions />

        {/* Warning */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={20} color={COLORS.WARNING} />
          <Text style={styles.warningText}>
            Este código QR es de uso único y expira automáticamente después de 1 hora
          </Text>
        </View>
      </ScrollView>

      <FloatingChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND_SECONDARY },
  header: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontFamily: 'BarlowCondensed-Bold',
  },
  placeholder: { width: 40 },
  scrollContainer: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100 },
  beneficioInfo: { alignItems: 'center', marginBottom: 30 },
  categoriaTag: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoriaText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  comercioName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'BarlowCondensed-Bold',
  },
  descuentoText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  timerWrapper: { alignItems: 'center', marginBottom: 30 },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WARNING_LIGHT,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: { flex: 1, fontSize: 13, color: COLORS.WARNING_DARK, marginLeft: 12, lineHeight: 18 },
});
