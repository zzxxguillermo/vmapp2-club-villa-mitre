import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../features/auth/hooks/useAuth';
import { COLORS } from '../constants/colors';
import { FloatingChatBot } from '../components/FloatingChatBot';
import { useBeneficios } from '../features/beneficios/hooks/useBeneficios';
import { BeneficioCard } from '../features/beneficios/components/BeneficioCard';
import { Beneficio } from '../features/beneficios/types';

/* ===================== Helpers ===================== */
// Helper para construir la URL de preview del QR (para debug)
const buildFinalClaimUrlPreview = (pathOrAbs?: string | null): string | null => {
  if (!pathOrAbs) return null;
  const API_BASE = 'https://surtekbb.com';
  if (/^https?:\/\//i.test(pathOrAbs)) return pathOrAbs;
  let p = pathOrAbs.startsWith('/') ? pathOrAbs : `/${pathOrAbs}`;
  if (!p.startsWith('/api/')) p = `/api${p}`;
  return `${API_BASE}${p}`;
};

// Normaliza claimUrl a RUTA RELATIVA si viene absoluta
const toRelativeIfAbsolute = (u?: string | null): string | null | undefined => {
  if (!u || typeof u !== 'string') return u;
  if (/^https?:\/\//i.test(u)) {
    try {
      const parsed = new URL(u);
      return parsed.pathname + (parsed.search || '');
    } catch {
      return u;
    }
  }
  return u;
};

/* ===================== Screen ===================== */
export default function MisBeneficiosScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const {
    beneficios,
    loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refresh,
    isRefreshing,
  } = useBeneficios();

  const goToQR = useCallback(
    (beneficio: Beneficio) => {
      if (!beneficio) return;

      const promotionId = String(beneficio.originalId ?? beneficio.raw?.id ?? beneficio.id);
      const claimRel = toRelativeIfAbsolute(beneficio.claimUrl ?? undefined) ?? undefined;

      const finalPreview = buildFinalClaimUrlPreview(
        claimRel ?? `/api/v1/promotions/${promotionId}/claim-qr`
      );

      if (__DEV__) {
        console.log('[MisBeneficios] → Generar QR', {
          promotionId,
          claimUrlOriginal: beneficio.claimUrl ?? null,
          claimUrlRelativa: claimRel ?? null,
          finalUrlPreview: finalPreview,
        });
      }

      navigation.navigate('QRBeneficio', {
        beneficio: {
          ...beneficio,
          id: promotionId,
          claimUrl: claimRel,
        },
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Beneficio }) => {
      return (
        <BeneficioCard
          beneficio={item}
          userType={user?.user_type}
          onPressQR={goToQR}
        />
      );
    },
    [goToQR, user?.user_type]
  );

  const keyExtractor = useCallback((b: Beneficio) => b.id, []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis beneficios</Text>
        <Text style={styles.headerSub}>
          {beneficios.length} {beneficios.length === 1 ? 'beneficio' : 'beneficios'}
        </Text>
      </View>
    ),
    [beneficios.length]
  );

  const ListFooter = useMemo(
    () => (
      <View style={styles.footerWrap}>
        {isFetchingNextPage && <ActivityIndicator size="small" color={COLORS.PRIMARY_GREEN} />}
        {!isFetchingNextPage && !hasNextPage && beneficios.length > 0 && (
          <Text style={styles.endText}>No hay más beneficios</Text>
        )}
      </View>
    ),
    [isFetchingNextPage, hasNextPage, beneficios.length]
  );

  const Empty = useMemo(
    () => (
      <View style={styles.empty}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} />
            <Text style={styles.muted}>Cargando beneficios…</Text>
          </>
        ) : error ? (
          <>
            <Ionicons name="warning-outline" size={28} color={COLORS.ERROR} />
            <Text style={styles.errorText}>Ocurrió un error: {error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refresh()}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons name="gift-outline" size={28} color={COLORS.GRAY_MEDIUM} />
            <Text style={styles.muted}>No tenés beneficios disponibles.</Text>
          </>
        )}
      </View>
    ),
    [loading, error, refresh]
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={beneficios}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={beneficios.length === 0 ? styles.ccEmpty : styles.cc}
        ListHeaderComponent={beneficios.length > 0 ? ListHeader : null}
        ListFooterComponent={beneficios.length > 0 ? ListFooter : null}
        ListEmptyComponent={Empty}
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={COLORS.PRIMARY_GREEN}
            colors={[COLORS.PRIMARY_GREEN]}
          />
        }
        estimatedItemSize={300}
      />
      <FloatingChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND_PRIMARY || '#ffffff' },
  // list: { flex: 1 }, // Removed as FlashList fills parent by default or handled via contentContainerStyle
  cc: { padding: 12, paddingBottom: 24 },
  ccEmpty: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { paddingHorizontal: 8, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.PRIMARY_BLACK },
  headerSub: { marginTop: 2, fontSize: 14, color: COLORS.GRAY_MEDIUM },
  footerWrap: { paddingVertical: 16, alignItems: 'center' },
  endText: { textAlign: 'center', color: COLORS.GRAY_MEDIUM, fontSize: 12 },
  empty: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  muted: { fontSize: 13, color: COLORS.GRAY_MEDIUM, textAlign: 'center' },
  errorText: { color: COLORS.ERROR, textAlign: 'center' },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.BORDER_LIGHT,
  },
  retryText: { color: COLORS.PRIMARY_BLACK, fontWeight: '600', textAlign: 'center' },
});
