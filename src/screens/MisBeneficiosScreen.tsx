import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  ActivityIndicator, TouchableOpacity, RefreshControl, Linking, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/colors';
import { FloatingChatBot } from '../components/FloatingChatBot';

/* ===================== UI / Palette ===================== */
const P = COLORS as Record<string, string>;
const UI = {
  primary: P.PRIMARY_GREEN ?? P.PRIMARY ?? '#22c55e',
  text: '#111827',
  textMuted: '#6b7280',
  bg: '#ffffff',
  card: '#ffffff',
  border: '#e5e7eb',
  danger: P.DANGER_RED ?? P.RED ?? '#ef4444',
} as const;

/* ===================== API CONFIG ===================== */
const API_BASE = ('https://surtekbb.com').replace(/\/+$/,'');
const ENDPOINT = `${API_BASE}/api/v1/promotions`;
const PER_PAGE = 15;
const TOKEN: string | null = null;

/* ===================== Tipos ===================== */
type ApiPromotion = any;

type Beneficio = {
  id: string;                   // usado para navegación
  originalId?: string | number; // ID real del backend
  claimUrl?: string | null;     // URL directa de claim si tu API la envía (puede venir absoluta)
  comercio: string;
  descuento: string;
  categoria?: string;
  direccion?: string;
  telefono?: string;
  imagenUrl: string;
  titulo?: string;
  descripcion?: string;
  raw?: any;
};

/* ===================== Helpers (parsers/mappers) ===================== */
const SURTEK_HTTP = /^http:\/\/([a-z0-9.-]*\.)?surtekbb\.com/i;
const toHttpsIfSurtek = (u: string) => (SURTEK_HTTP.test(u) ? u.replace(/^http:\/\//i, 'https://') : u);

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

// SOLO para logging en esta pantalla:
// Simula cómo la pantalla de QR construye la URL final (preview para debug)
const buildFinalClaimUrlPreview = (pathOrAbs?: string | null): string | null => {
  if (!pathOrAbs) return null;
  // Si es absoluta, devolver tal cual (esto es lo que usaría la QR screen)
  if (/^https?:\/\//i.test(pathOrAbs)) return pathOrAbs;
  // Aseguramos prefijo "/"
  let p = pathOrAbs.startsWith('/') ? pathOrAbs : `/${pathOrAbs}`;
  // Si no empieza con /api/, anteponerlo (la QR screen hace esto)
  if (!p.startsWith('/api/')) p = `/api${p}`;
  return `${API_BASE}${p}`;
};

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
  return 'https://picsum.photos/seed/benefit/600/360';
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
function pickCategory(p: ApiPromotion): string | undefined {
  return p?.category?.name || p?.categoria || p?.category || undefined;
}
function pickAddress(p: ApiPromotion): string | undefined {
  return p?.commerce?.address || p?.comercio?.direccion || p?.direccion || p?.address || undefined;
}
function pickPhone(p: ApiPromotion): string | undefined {
  return p?.commerce?.phone || p?.comercio?.telefono || p?.telefono || p?.phone || undefined;
}

function mapApiToBeneficio(p: ApiPromotion): Beneficio {
  const titulo = p.title ?? p.titulo ?? p.name ?? 'Beneficio';
  const descripcion = p.description ?? p.descripcion ?? '';
  const descuento =
    p.discount_text ??
    p.descuento ??
    p.benefit_text ??
    (titulo ? String(titulo) : 'Beneficio');

  const originalId = p.id ?? p.promotion_id ?? p.promo_id;
  const id = String(originalId ?? p.uid ?? p.code ?? Math.random());

  const claimRaw: string | null = p.claim_qr_url ?? p.claimUrl ?? null;
  const claimUrl = toRelativeIfAbsolute(claimRaw) ?? null;

  return {
    id,
    originalId,
    claimUrl,
    comercio: pickCommerceName(p),
    categoria: pickCategory(p),
    descuento: String(descuento),
    direccion: pickAddress(p),
    telefono: pickPhone(p),
    imagenUrl: buildImageUrl(p),
    titulo: String(titulo),
    descripcion: String(descripcion),
    raw: p,
  };
}

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
            onError={() => { setLoading(false); setError(true); }}
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

/* ===================== Screen ===================== */
export default function MisBeneficiosScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [items, setItems] = useState<Beneficio[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

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

        setItems(prev => (replace ? mapped : [...prev, ...mapped]));
        setPage(nextPage);
        setHasMore(computeHasMore(json, list.length));

        if (nextPage === 1) setBoot(false);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setError(e?.message || 'Error al cargar');
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

  const goToQR = useCallback((beneficio: Beneficio) => {
    if (!beneficio) return;

    // ID consistente para el claim
    const promotionId = String(beneficio.originalId ?? beneficio.raw?.id ?? beneficio.id);

    // Normalizamos claimUrl a relativa
    const claimRel = toRelativeIfAbsolute(beneficio.claimUrl ?? undefined) ?? undefined;

    // PREVIEW de la URL final que construirá la QR screen (para debug)
    const finalPreview = buildFinalClaimUrlPreview(claimRel ?? `/api/v1/promotions/${promotionId}/claim-qr`);

    // 🔎 Logs completos
    console.log('[MisBeneficios] → Generar QR', {
      API_BASE,
      promotionId,
      claimUrlOriginal: beneficio.claimUrl ?? null,
      claimUrlRelativa: claimRel ?? null,
      finalUrlPreview: finalPreview,
    });

    navigation.navigate('QRBeneficio', {
      beneficio: {
        ...beneficio,
        id: promotionId,     // aseguramos ID real
        claimUrl: claimRel,  // pasamos relativa para evitar duplicar host
      },
    });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Beneficio }) => {
      if (!item) return null;
      return (
        <View style={styles.card}>
          <ImageWithLoader uri={item.imagenUrl} style={styles.image} />

          <View style={styles.cardBody}>
            <View style={styles.topRow}>
              <Text style={styles.comercio} numberOfLines={2}>{item.comercio}</Text>
              {!!item.categoria && (
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{item.categoria}</Text>
                </View>
              )}
            </View>

            <Text style={styles.descuento} numberOfLines={3}>
              {item.descuento || item.titulo || 'Beneficio'}
            </Text>

            {!!item.direccion && (
              <View style={styles.row}>
                <Ionicons name="location-outline" size={16} color={UI.textMuted} />
                <Text style={styles.muted} numberOfLines={1}>{item.direccion}</Text>
              </View>
            )}
            {!!item.telefono && (
              <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`tel:${item.telefono}`)}>
                <Ionicons name="call-outline" size={16} color={UI.textMuted} />
                <Text style={[styles.muted, styles.link]} numberOfLines={1}>{item.telefono}</Text>
              </TouchableOpacity>
            )}

            {user?.user_type === 'api' && (
              <TouchableOpacity style={styles.qrBtn} onPress={() => goToQR(item)} activeOpacity={0.85}>
                <Ionicons name="qr-code-outline" size={20} color="#fff" />
                <Text style={styles.qrText}>Generar QR</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [goToQR, user?.user_type]
  );

  const keyExtractor = useCallback((b: Beneficio) => b.id, []);

  const isBooting = boot || (items.length === 0 && loading && page === 1);

  const ListHeader = useMemo(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Mis beneficios</Text>
      <Text style={styles.headerSub}>{items.length} {items.length === 1 ? 'beneficio' : 'beneficios'}</Text>
    </View>
  ), [items.length]);

  const ListFooter = useMemo(() => (
    <View style={styles.footerWrap}>
      {loading && <ActivityIndicator size="small" color={UI.primary} />}
      {!loading && !hasMore && items.length > 0 && (
        <Text style={styles.endText}>No hay más beneficios</Text>
      )}
    </View>
  ), [loading, hasMore, items.length]);

  const Empty = useMemo(() => (
    <View style={styles.empty}>
      {isBooting ? (
        <>
          <ActivityIndicator size="large" color={UI.primary} />
          <Text style={styles.muted}>Cargando beneficios…</Text>
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
          <Ionicons name="gift-outline" size={28} color={UI.textMuted} />
          <Text style={styles.muted}>No tenés beneficios disponibles.</Text>
        </>
      )}
    </View>
  ), [isBooting, error, loadPage]);

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

/* ===================== Styles ===================== */
const { height } = Dimensions.get('window');
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
  image: { width: '100%', height: Math.max(CARD_H, Math.min(280, height * 0.28)), backgroundColor: '#f3f4f6' },
  imageLoader: { position: 'absolute', zIndex: 1 },
  imagePlaceholder: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderTopWidth: StyleSheet.hairlineWidth, borderColor: UI.border,
  },
  imagePlaceholderText: { color: '#6b7280', fontSize: 13 },

  cardBody: { padding: 12, gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  comercio: { flex: 1, fontSize: 18, fontWeight: '700', color: UI.text },

  categoryPill: { backgroundColor: UI.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  descuento: { marginTop: 2, fontSize: 15, color: UI.text },

  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muted: { fontSize: 13, color: UI.textMuted, flexShrink: 1 },
  link: { textDecorationLine: 'underline' },

  qrBtn: {
    marginTop: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6,
    backgroundColor: UI.primary,
    paddingVertical: 12, borderRadius: 12,
  },
  qrText: { color: '#fff', fontWeight: '700' },

  footerWrap: { paddingVertical: 16, alignItems: 'center' },
  endText: { textAlign: 'center', color: UI.textMuted, fontSize: 12 },

  empty: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: UI.bg },
  errorText: { color: UI.danger, textAlign: 'center' },

  retryBtn: {
    marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: UI.card, borderWidth: StyleSheet.hairlineWidth, borderColor: UI.border,
  },
  retryText: { color: UI.text, fontWeight: '600', textAlign: 'center' },
});
