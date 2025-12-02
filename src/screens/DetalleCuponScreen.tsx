// DetalleCuponScreen.tsx
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { apiClient } from '../services';

const API_BASE = 'https://surtekbb.com';

/* Helpers */
const toHttpsIfSurtek = (u: string) =>
  /^http:\/\//i.test(u) && /surtekbb\.com/.test(u) ? u.replace(/^http/i, 'https') : u;
const pad = (n: number) => String(n).padStart(2, '0');
const formatISOToAR = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const buildImageUrl = (obj: any): string => {
  const direct = obj?.imagenUrl ?? obj?.image_url ?? obj?.image ?? null;
  if (typeof direct === 'string' && direct.length) {
    return /^https?:\/\//i.test(direct)
      ? toHttpsIfSurtek(direct)
      : `${API_BASE}/${direct.replace(/^\/+/, '')}`;
  }
  const link = obj?.image_link ?? obj?.imageLink;
  if (typeof link === 'string' && link.length) return toHttpsIfSurtek(link);
  const path = obj?.image_path ?? obj?.imagePath;
  if (typeof path === 'string' && path.length) {
    if (/^https?:\/\//i.test(path)) return toHttpsIfSurtek(path);
    const normalized = path.replace(/^\/+/, '');
    const urlPath = normalized.startsWith('promotions/') ? `storage/${normalized}` : normalized;
    return `${API_BASE}/${urlPath}`;
  }
  return 'https://picsum.photos/seed/promo/800/450';
};
const pickInicio = (raw?: any): string =>
  raw
    ? (raw.starts_at_human ??
      (raw.starts_at_iso && formatISOToAR(raw.starts_at_iso)) ??
      (raw.starts_at && formatISOToAR(raw.starts_at)) ??
      '')
    : '';
const pickFin = (raw?: any): string =>
  raw
    ? (raw.ends_at_human ??
      (raw.ends_at_iso && formatISOToAR(raw.ends_at_iso)) ??
      (raw.ends_at && formatISOToAR(raw.ends_at)) ??
      '')
    : '';

/* Tipos/UI */
type UiCupon = {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  validoInicio: string;
  validoFin: string;
  terms?: string;
  raw?: any;
};
const fromBeneficio = (b?: any): UiCupon => {
  const safe = b ?? {};
  const raw = safe.raw ?? safe;
  return {
    id: String(safe.id ?? ''),
    titulo: String(safe.titulo ?? 'Promoción'),
    descripcion: String(safe.descripcion ?? ''),
    imagenUrl: buildImageUrl(safe),
    validoInicio: pickInicio(raw),
    validoFin: pickFin(raw),
    terms: raw?.terms ?? '',
    raw,
  };
};
const fromApi = (a?: any): UiCupon => {
  const x = a ?? {};
  return {
    id: String(x.id ?? ''),
    titulo: String(x.title ?? 'Promoción'),
    descripcion: String(x.description ?? ''),
    imagenUrl: buildImageUrl(x),
    validoInicio: pickInicio(x),
    validoFin: pickFin(x),
    terms: x.terms ?? '',
    raw: x,
  };
};

/* API claim */
type ClaimResponse = {
  code?: string;
  qr_url?: string;
  data?: any;
  qr?: { code?: string; url?: string };
};
async function claimQr(promotionId: string | number, payload: any) {
  const res = await fetch(`${API_BASE}/api/v1/promotions/${promotionId}/claim-qr`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });
  const json: ClaimResponse = await res.json().catch(() => ({}) as any);
  if (!res.ok) throw new Error((json as any)?.message || `HTTP ${res.status}`);
  return {
    code: json.code ?? json.qr?.code ?? json.data?.code,
    qr_url: json.qr_url ?? json.qr?.url ?? json.data?.qr_url,
  };
}

/* Image con loader */
const ImageWithLoader: React.FC<{ uri: string; style: any }> = ({ uri, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const hasUri = typeof uri === 'string' && uri.length > 0;
  return (
    <View style={[style, { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }]}>
      {hasUri ? (
        <>
          {loading && (
            <ActivityIndicator size="small" color="#4CAF50" style={{ position: 'absolute' }} />
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
        <View
          style={[
            style,
            { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
          ]}
        >
          <Text style={{ color: '#666' }}>Sin imagen</Text>
        </View>
      )}
      {error && (
        <View
          style={[
            style,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
            },
          ]}
        >
          <Text style={{ color: '#666' }}>Error al cargar</Text>
        </View>
      )}
    </View>
  );
};

/* ====== SCREEN ====== */
export default function DetalleCuponScreen({ route }: any) {
  const navigation = useNavigation<any>();

  // Cupón desde params
  const params = route?.params ?? {};
  const paramObj =
    params.beneficio ?? params.cupon ?? params.item ?? params.promotion ?? params.promo ?? null;
  const [cupon] = useState<UiCupon | null>(
    paramObj ? (paramObj.titulo ? fromBeneficio(paramObj) : fromApi(paramObj)) : null
  );

  // userId vía apiClient (/auth/me)
  const [authUserId, setAuthUserId] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const meResp = await apiClient.get('/auth/me'); // axios-like
        const meBody = meResp?.data ?? meResp ?? null; // body
        const meUser = meBody?.data ?? meBody ?? null; // usuario

        const idNum = resolveIdFromMany(meUser);
        if (alive) setAuthUserId(idNum);
      } catch {
        if (alive) setAuthUserId(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [claimed, setClaimed] = useState<{ code?: string; qr_url?: string } | null>(null);

  const safe = useMemo<UiCupon>(
    () =>
      cupon ?? {
        id: '',
        titulo: '',
        descripcion: '',
        imagenUrl: '',
        validoInicio: '',
        validoFin: '',
        terms: '',
        raw: null,
      },
    [cupon]
  );

  useLayoutEffect(() => {
    const t = safe.titulo || safe.raw?.title || 'Detalle';
    navigation.setOptions?.({ title: t });
  }, [navigation, safe.titulo, safe.raw?.title]);

  const toIntOrNull = (v: unknown): number | null => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isInteger(n) ? n : null;
  };

  const resolveIdFromMany = (u: any): number | null => {
    const cands = [
      u?.id,
      u?.user?.id,
      u?.usuario?.id,
      u?.member?.id,
      u?.socio_id,
      u?.socioId,
      u?.member_id,
      u?.user_id,
      typeof u?.nroSocio === 'string' && /^\d+$/.test(u.nroSocio) ? Number(u.nroSocio) : null,
    ];
    for (const c of cands) {
      const n = toIntOrNull(c);
      if (n != null) return n;
    }
    return null;
  };

  // user_id numérico obligatorio (params → auth → raw)
  const resolveNumericUserId = (): number | null => {
    const fromParams = toIntOrNull(params?.userId ?? params?.user_id);
    if (fromParams != null) return fromParams;
    if (authUserId != null) return authUserId;
    const fromRaw = toIntOrNull(safe.raw?.user_id);
    if (fromRaw != null) return fromRaw;
    return null;
  };

  const handleClaim = async () => {
    if (!safe.id) return;

    const user_id = resolveNumericUserId();
    if (user_id == null) {
      setClaimError(
        'Necesitás iniciar sesión para reclamar este cupón (user_id numérico requerido).'
      );
      return;
    }

    try {
      setClaimError(null);
      setClaiming(true);

      const payload = { user_id, platform: Platform.OS, app: 'vmAPP' };
      const result = await claimQr(safe.id, payload);

      setClaimed({ code: result.code, qr_url: result.qr_url });
      setModalVisible(true);
    } catch (e: any) {
      setClaimError(e?.message || 'No se pudo obtener el cupón');
    } finally {
      setClaiming(false);
    }
  };

  const hasValidez = Boolean(safe.validoInicio || safe.validoFin);
  const lineaValidez =
    safe.validoInicio && safe.validoFin
      ? `${safe.validoInicio} — ${safe.validoFin}`
      : safe.validoInicio || safe.validoFin || '—';
  const qrValue = claimed?.code ?? `PROMO-${safe.id}`;

  if (!safe.id && !safe.titulo && !safe.descripcion && !safe.imagenUrl) {
    return (
      <View style={[styles.container, { justifyContent: 'center', padding: 20 }]}>
        <Text style={{ textAlign: 'center', color: '#333' }}>
          No se recibió el cupón en <Text style={{ fontWeight: 'bold' }}>route.params</Text>.
        </Text>
        <Text style={{ fontFamily: 'monospace', marginTop: 8, textAlign: 'center', color: '#333' }}>
          {'navigation.navigate("DetalleCupon", { beneficio: item, userId: user.id });'}
        </Text>
      </View>
    );
  }

  const mustLogin = resolveNumericUserId() == null;

  return (
    <View style={styles.container}>
      <ImageWithLoader uri={safe.imagenUrl} style={styles.image} />
      <Text style={styles.title}>{safe.titulo || 'Promoción'}</Text>
      <Text style={styles.desc}>{safe.descripcion || '—'}</Text>

      <Text style={styles.validLabel}>Válido:</Text>
      <Text style={styles.validValue}>{hasValidez ? lineaValidez : '—'}</Text>

      {!!safe.terms && (
        <>
          <Text style={styles.termsLabel}>Términos:</Text>
          <Text style={styles.termsValue}>{safe.terms}</Text>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, (claiming || mustLogin) && { opacity: 0.6 }]}
        onPress={handleClaim}
        disabled={claiming || mustLogin}
      >
        {claiming ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Obtener Cupón</Text>
        )}
      </TouchableOpacity>

      {!!mustLogin && (
        <Text style={styles.infoText}>
          Iniciá sesión para canjear (user_id numérico requerido).
        </Text>
      )}
      {!!claimError && <Text style={styles.errorText}>{claimError}</Text>}

      {/* Modal con QR */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tu Cupón</Text>
            <QRCode value={String(qrValue)} size={200} />
            {!!claimed?.qr_url && (
              <Text style={styles.qrNote}>También tenés un enlace asociado al QR.</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#FFFFFF' },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6, textAlign: 'center', color: '#333' },
  desc: { fontSize: 16, textAlign: 'center', marginBottom: 12, color: '#666' },

  validLabel: { alignSelf: 'flex-start', color: '#6b7280', fontWeight: '600' },
  validValue: { alignSelf: 'flex-start', color: '#333', marginBottom: 12 },

  termsLabel: { alignSelf: 'flex-start', color: '#6b7280', fontWeight: '600', marginTop: 4 },
  termsValue: { alignSelf: 'flex-start', color: '#444', marginBottom: 16 },

  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  infoText: { marginTop: 8, color: '#374151', textAlign: 'center' },
  errorText: { marginTop: 8, color: '#b91c1c', textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: 320,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  qrNote: { marginTop: 8, color: '#6b7280', fontSize: 12 },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
});
