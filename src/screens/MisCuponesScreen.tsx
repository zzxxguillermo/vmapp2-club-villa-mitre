// MisCuponesScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS } from '../constants/colors';
import { FloatingChatBot } from '../components/FloatingChatBot';

// ===== Paleta clara (fondo blanco) =====
const P = COLORS as Record<string, string>;
const UI = {
  primary: COLORS.PRIMARY_GREEN,
  text: COLORS.PRIMARY_BLACK,
  textMuted: COLORS.GRAY_DARK,
  bg: COLORS.BACKGROUND_PRIMARY,
  card: COLORS.WHITE,
  border: COLORS.BORDER_LIGHT,
  danger: COLORS.ERROR,
} as const;

// ====== CONFIG API ======
const API_BASE = 'https://surtekbb.com';
const ENDPOINT = `${API_BASE}/api/v1/promotions`;
const PER_PAGE = 15;
const TOKEN: string | null = null;

// ====== Tipos ======
type ApiPromotion = any;
type Beneficio = {
  id: string;
  titulo: string;
  comercio: string;
  descripcion: string;
  direccion?: string;
  telefono?: string;
  imagenUrl: string;
  raw?: any;
};

// ====== Helpers ======
const SURTEK_HTTP = /^http:\/\/([a-z0-9.-]*\.)?surtekbb\.com/i;
const toHttpsIfSurtek = (u: string) =>
  SURTEK_HTTP.test(u) ? u.replace(/^http:\/\//i, 'https://') : u;

function buildImageUrl(p: ApiPromotion): string {
  const link: string | undefined = p.image_link || p.imageLink;
  if (link && /^https?:\/\//i.test(link)) return toHttpsIfSurtek(link);
  const path: string | undefined = p.image_path || p.imagePath;
  if (path && typeof path === 'string') {
    const normalized = path.replace(/^\/+/, '');
    const urlPath = normalized.startsWith('promotions/') ? `storage/${normalized}` : normalized;
    return `${API_BASE}/${urlPath}`;
  }
  const fallback = p.image_url ?? p.image ?? p.imagenUrl ?? null;
  if (fallback && typeof fallback === 'string') {
    return /^https?:\/\//i.test(fallback)
      ? toHttpsIfSurtek(fallback)
      : `${API_BASE}/${fallback.replace(/^\/+/, '')}`;
  }
  return 'https://picsum.photos/seed/promo/600/360';
}

function pickCommerceName(p: ApiPromotion): string {
  return (
    p?.commerce?.name ||
    p?.comercio?.nombre ||
    p?.comercio ||
    p?.establecimiento ||
    p?.business_name ||
    p?.merchantName ||
    'Comercio'
  );
}
function pickAddress(p: ApiPromotion): string | undefined {
  return p?.commerce?.address || p?.comercio?.direccion || p?.direccion || p?.address || undefined;
}
function pickPhone(p: ApiPromotion): string | undefined {
  return p?.commerce?.phone || p?.comercio?.telefono || p?.telefono || p?.phone || undefined;
}

function mapApiToBeneficio(p: ApiPromotion): Beneficio {
  const titulo = p.title ?? p.titulo ?? 'Promoción';
  const descripcion = p.description ?? p.descripcion ?? '';
  return {
    id: String(p.id ?? p.uid ?? p.code ?? Math.random()),
    titulo: String(titulo),
    comercio: pickCommerceName(p),
    descripcion: String(descripcion),
    direccion: pickAddress(p),
    telefono: pickPhone(p),
    imagenUrl: buildImageUrl(p),
    raw: p,
  };
}

// Fecha → "dd/mm/yyyy HH:MM"
const formatISOToAR = (iso?: string | null) => {
  if (!iso || typeof iso !== 'string') return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const getValidoHasta = (raw?: any): string => {
  if (raw?.ends_at_human) return String(raw.ends_at_human);
  if (raw?.ends_at_iso) return formatISOToAR(raw.ends_at_iso);
  if (raw?.ends_at) return formatISOToAR(raw.ends_at);
  return '-';
};

// ====== UI ======
const { width } = Dimensions.get('window');
const CARD_H = Math.round((width * 9) / 16);

// Imagen con loader
const ImageWithLoader: React.FC<{ uri: string; style: any }> = ({ uri, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const hasUri = typeof uri === 'string' && uri.length > 0;

  return (
    <View style={[style, styles.imageWrap]}>
      {hasUri ? (
        <>
          {loading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="small" color={UI.primary} />
            </View>
          )}
          <Image
            source={{ uri }}
            style={style}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </>
      ) : (
        <View style={[style, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
        </View>
      )}
      {error && (
        <View style={[style, styles.imagePlaceholder, { position: 'absolute', top: 0, left: 0 }]}>
          <Text style={styles.imagePlaceholderText}>Error al cargar</Text>
        </View>
      )}
    </View>
  );
};

export default function MisCuponesScreen() {
  const navigation = useNavigation<any>();

  const [items, setItems] = useState<Beneficio[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // 🛠 FLAG de primera carga: sólo se apaga en éxito o error real, NO en abort
  const [boot, setBoot] = useState<boolean>(true);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const headers = useMemo(() => {
    const h: Record<string, string> = { Accept: 'application/json' };
    if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
    return h;
  }, []);

  const parseList = (json: any): ApiPromotion[] => {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json?.results)) return json.results;
    return [];
  };

  const computeHasMore = (json: any, received: number): boolean => {
    if (json?.meta?.current_page != null && json?.meta?.last_page != null) {
      return Number(json.meta.current_page) < Number(json.meta.last_page);
    }
    if (json?.links?.next) return true;
    return received >= PER_PAGE;
  };

  const loadPage = useCallback(
    async (nextPage: number, replace = false) => {
      if (loading && !(replace && nextPage === 1)) return;

      setLoading(true);
      setError(null);

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const url = `${ENDPOINT}?page=${nextPage}&per_page=${PER_PAGE}`;
        const res = await fetch(url, { headers, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const list = parseList(json);
        const mapped = list.map(mapApiToBeneficio);

        setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
        setPage(nextPage);
        setHasMore(computeHasMore(json, list.length));

        // 🛠 Primera carga terminada con éxito
        if (nextPage === 1) setBoot(false);
      } catch (e: any) {
        if (e?.name === 'AbortError') {
          // 🛠 No tocar boot ni error en abort (evita flash de “No hay cupones”)
          return;
        }
        setError(e?.message || 'Error al cargar');

        // 🛠 Primera carga terminó con error real
        if (nextPage === 1) setBoot(false);
      } finally {
        setLoading(false);
      }
    },
    [headers, loading]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPage(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (!loading && hasMore) {
      loadPage(page + 1);
    }
  }, [loading, hasMore, page, loadPage]);

  useEffect(() => {
    loadPage(1, true);
    return () => abortRef.current?.abort();
  }, [loadPage]);

  const goToDetalle = useCallback(
    (beneficio: Beneficio) => {
      if (!beneficio) return;
      navigation.navigate('DetalleCupon', { beneficio, raw: beneficio.raw, id: beneficio.id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Beneficio }) => {
      if (!item) return null;
      return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => goToDetalle(item)}>
          <ImageWithLoader uri={item.imagenUrl} style={styles.image} />
          <View style={styles.cardBody}>
            <Text style={styles.title} numberOfLines={2}>
              {item.titulo}
            </Text>

            <View style={styles.row}>
              <Ionicons name="storefront-outline" size={16} color={UI.textMuted} />
              <Text style={styles.muted} numberOfLines={1}>
                {item.comercio}
              </Text>
            </View>

            {!!item.direccion && (
              <View style={styles.row}>
                <Ionicons name="location-outline" size={16} color={UI.textMuted} />
                <Text style={styles.muted} numberOfLines={1}>
                  {item.direccion}
                </Text>
              </View>
            )}

            {!!item.telefono && (
              <TouchableOpacity
                style={styles.row}
                onPress={() => Linking.openURL(`tel:${item.telefono}`)}
              >
                <Ionicons name="call-outline" size={16} color={UI.textMuted} />
                <Text style={[styles.muted, styles.link]} numberOfLines={1}>
                  {item.telefono}
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.desc} numberOfLines={3}>
              {item.descripcion || '—'}
            </Text>

            <View style={styles.footerRow}>
              <View style={styles.badge}>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={styles.badgeText}>Válido hasta: {getValidoHasta(item.raw)}</Text>
              </View>

              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>Ver detalle</Text>
                <Ionicons name="chevron-forward" size={18} color={UI.primary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [goToDetalle]
  );

  const keyExtractor = useCallback((b: Beneficio) => b.id, []);

  // 🛠 Flag derivado: mientras sea la primera carga y no haya error, mostramos loader central
  const isBooting = boot || (items.length === 0 && loading && page === 1);

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis cupones</Text>
        <Text style={styles.headerSub}>
          {items.length} {items.length === 1 ? 'cupón' : 'cupones'}
        </Text>
      </View>
    ),
    [items.length]
  );

  const ListFooter = useMemo(
    () => (
      <View style={styles.footerWrap}>
        {loading && <ActivityIndicator size="small" color={UI.primary} />}
        {!loading && !hasMore && items.length > 0 && (
          <Text style={styles.endText}>No hay más cupones</Text>
        )}
      </View>
    ),
    [loading, hasMore, items.length]
  );

  const Empty = useMemo(
    () => (
      <View style={styles.empty}>
        {isBooting ? (
          <>
            <ActivityIndicator size="large" color={UI.primary} />
            <Text style={styles.muted}>Cargando cupones…</Text>
          </>
        ) : error ? (
          <>
            <Ionicons name="warning-outline" size={28} color={UI.danger} />
            <Text style={styles.errorText}>Ocurrió un error: {error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadPage(1, true)}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons name="ticket-outline" size={28} color={UI.textMuted} />
            <Text style={styles.muted}>No tenés cupones disponibles.</Text>
          </>
        )}
      </View>
    ),
    [isBooting, error, loadPage]
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={items.filter(Boolean)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={items.length === 0 ? styles.ccEmpty : styles.cc}
        ListHeaderComponent={items.length > 0 ? ListHeader : null}
        ListFooterComponent={items.length > 0 ? ListFooter : null}
        ListEmptyComponent={Empty}
        onEndReachedThreshold={0.3}
        onEndReached={onEndReached}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={UI.primary}
            colors={[UI.primary]}
            progressBackgroundColor="#fff"
          />
        }
      />
      <FloatingChatBot />
    </View>
  );
}

// ====== Styles ======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  list: { flex: 1, backgroundColor: UI.bg },

  cc: { padding: 12, paddingBottom: 24, backgroundColor: UI.bg },
  ccEmpty: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: UI.bg },

  header: { paddingHorizontal: 8, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: UI.text },
  headerSub: { marginTop: 2, fontSize: 14, color: UI.textMuted },

  card: {
    backgroundColor: UI.card,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  imageWrap: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  image: { width: '100%', height: CARD_H, backgroundColor: COLORS.GRAY_LIGHTEST },
  imageLoader: { position: 'absolute', zIndex: 1 },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_LIGHTEST,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
  },
  imagePlaceholderText: { color: COLORS.GRAY_DARK, fontSize: 13 },

  cardBody: { padding: 12, gap: 6 },
  title: { fontSize: 18, fontWeight: '700', color: UI.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muted: { fontSize: 13, color: UI.textMuted, flexShrink: 1 },
  link: { textDecorationLine: 'underline' },
  desc: { marginTop: 6, fontSize: 14, color: UI.text },

  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: UI.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: COLORS.WHITE, fontSize: 12, fontWeight: '600' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ctaText: { color: UI.primary, fontWeight: '700' },

  footerWrap: { paddingVertical: 16, alignItems: 'center' },
  endText: { textAlign: 'center', color: UI.textMuted, fontSize: 12 },

  empty: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: UI.bg,
  },
  errorText: { color: UI.danger, textAlign: 'center' },

  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
  },
  retryText: { color: UI.text, fontWeight: '600', textAlign: 'center' },
});
