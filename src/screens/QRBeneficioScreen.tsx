import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions,
  ActivityIndicator, Image, ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/colors';
import { FloatingChatBot } from '../components/FloatingChatBot';
import { apiClient } from '../services';
import { useAuth } from '../hooks/useAuth'; // ⬅️ para obtener user.id

/** ===================== LOG ===================== **/
const LOG = '[QRBeneficio]';
const logI = (...a:any[]) => { if (__DEV__) console.log(LOG, ...a); };
const logE = (...a:any[]) => { if (__DEV__) console.error(LOG, ...a); };
const logW = (...a:any[]) => { if (__DEV__) console.warn(LOG, ...a); };

/** ===================== Tipos ===================== **/
type Beneficio = {
  id: string;
  comercio: string;
  descuento: string;
  categoria: string;
  direccion?: string;
  telefono?: string;
  imagenUrl: string;
  claimUrl?: string | null;
};

type RouteParams = { beneficio: Beneficio };

type LegacyClaimResp = {
  status?: string;
  message?: string;
  code?: string;
  qr_value?: string;
  expires_at?: string;
  seconds_left?: number;
  ttl_minutes?: number;
};

type ClaimByCodeResp = {
  status?: string;
  message?: string;
  code?: string;
  qr_value?: string;
  redeem_url?: string;
  expires_at?: string;
  seconds_left?: number;
  ttl_minutes?: number;
};

/** ===================== Config ===================== **/
const API_BASE   = process.env.EXPO_PUBLIC_API_BASE   ?? 'https://surtekbb.com';
const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX ?? '/api';
const API_VER    = 'v1';

/** ===================== Helpers ===================== **/
const ensureLeadingSlash = (s: string) => (s.startsWith('/') ? s : `/${s}`);
const joinUrl = (...parts: string[]) =>
  parts.map((p, i) => (i === 0 ? p.replace(/\/+$/,'') : p.replace(/^\/+/,''))).join('/');

function absoluteUrl(path: string) {
  return joinUrl(API_BASE, ensureLeadingSlash(API_PREFIX), ensureLeadingSlash(path));
}

function getAuthHeader(): string | undefined {
  const anyClient = apiClient as any;
  const a = anyClient?.defaults?.headers?.common?.Authorization
         || anyClient?.defaults?.headers?.Authorization;
  return typeof a === 'string' ? a : undefined;
}

async function fetchPostJSON<T=any>(absUrl: string, body: object): Promise<T> {
  const auth = getAuthHeader();
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = auth;

  logI('🌐 API POST (fetch)', absUrl);
  logI('📋 Headers', headers);
  const raw = JSON.stringify(body ?? {});
  logI('📄 Body', raw);

  const res = await fetch(absUrl, { method: 'POST', headers, body: raw });

  logI('📡 Status', res.status, res.statusText);

  let data: any = null;
  const ctype = res.headers.get('content-type') || '';
  if (ctype.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    const txt = await res.text().catch(() => '');
    data = txt || null;
  }

  if (!res.ok) {
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

function extractCode(s?: string | null): string | null {
  if (!s) return null;
  try {
    const path = s.startsWith('http') ? new URL(s).pathname : s;
    const m = path.match(/\/promotions\/qrs\/([^\/?#]+)/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function addParams(absUrl: string, params: Record<string, any>) {
  try {
    const u = new URL(absUrl);
    for (const [k,v] of Object.entries(params)) {
      if (v !== undefined && v !== null && String(v).length > 0) {
        u.searchParams.set(k, String(v));
      }
    }
    return u.toString();
  } catch {
    return absUrl;
  }
}

/** ===================== Identidad opcional ===================== **/
const useUserIdentity = () => {
  const dni = '30123456';
  const externalUserId = undefined as string | undefined;
  return { dni, externalUserId };
};

/** === Legacy: obtener code (ENVÍA user_id requerido) === **/
async function fetchLegacyCode(promoId: string, userId: number): Promise<{ code: string | null; data?: LegacyClaimResp }> {
  const url = absoluteUrl(`${API_VER}/promotions/${promoId}/claim-qr`);
  const payload = { user_id: userId }; // ⬅️ MANDAMOS user_id
  logI('🪣 Legacy claim para obtener code →', url, payload);
  const data = await fetchPostJSON<LegacyClaimResp>(url, payload);
  logI('🪣 Legacy resp', data);
  const code = data?.code ?? extractCode(data?.qr_value ?? '');
  return { code: code ?? null, data };
}

/** ===================== Componente ===================== **/
export default function QRBeneficioScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const params = (route?.params ?? {}) as Partial<RouteParams>;
  const beneficio = params?.beneficio as Beneficio | undefined;

  const { user } = useAuth();           // ⬅️ obtenemos el usuario autenticado
  const apiUserId = Number(user?.id);   // ⬅️ lo usamos para user_id
  const { dni, externalUserId } = useUserIdentity();

  const [qrValue, setQrValue] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const screenW = Dimensions.get('window').width;
  const qrSize  = useMemo(() => Math.min(screenW * 0.7, 280), [screenW]);

  useEffect(() => {
    (async () => {
      logI('HTTP env', { API_BASE, API_PREFIX, API_VER, apiBaseURL: (apiClient as any)?.defaults?.baseURL });
      logI('Auth user', { id: apiUserId, raw: user });

      if (!beneficio?.id) {
        setIsLoading(false);
        setErrorMsg('Faltan datos del beneficio.');
        return;
      }
      if (!apiUserId || Number.isNaN(apiUserId)) {         // ⬅️ validamos user_id
        setIsLoading(false);
        setErrorMsg('No se encontró el usuario autenticado (user_id). Iniciá sesión nuevamente.');
        return;
      }

      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setIsLoading(true);
      setErrorMsg(null);

      try {
        // 1) Conseguir {code}:
        let code = extractCode(beneficio?.claimUrl ?? null);
        if (!code) {
          const { code: legacyCode } = await fetchLegacyCode(beneficio.id, apiUserId); // ⬅️ manda user_id
          code = legacyCode;
        }
        if (!code) throw new Error('No se pudo obtener el código del QR.');

        // 2) Ruta nueva con QRS (también requiere user_id):
        const claimUrl = absoluteUrl(`${API_VER}/promotions/qrs/${code}/claim`);
        const claimPayload = { user_id: apiUserId }; // ⬅️ MANDAMOS user_id
        logI('🚀 Claim by CODE (ruta nueva)', claimUrl, claimPayload);

        const data = await fetchPostJSON<ClaimByCodeResp>(claimUrl, claimPayload);
        logI('✅ Claim by CODE resp', data);

        if (!data || data.status === 'error') {
          throw new Error((data as any)?.message || 'Respuesta de error del servidor.');
        }

        // 3) URL para el QR
        const rawQr = data.qr_value || data.redeem_url;
        if (rawQr) {
          setQrValue(addParams(rawQr, { dni, external_user_id: externalUserId, source: 'app' }));
        } else {
          const showAbs = absoluteUrl(`${API_VER}/promotions/qrs/${code}`);
          logW('No vino qr_value/redeem_url. Fallback showAbs', showAbs);
          setQrValue(addParams(showAbs, { dni, external_user_id: externalUserId, source: 'app' }));
        }

        // 4) Timer
        const secs = Math.max(0, data.seconds_left ?? 0);
        setTimeRemaining(secs);
        setIsLoading(false);

        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              Alert.alert(
                'QR Expirado',
                'Este código QR ha expirado. Podés generar uno nuevo.',
                [
                  { text: 'Generar nuevo', onPress: () => (navigation as any).replace?.('QRBeneficio', { beneficio }) },
                  { text: 'Volver', onPress: () => navigation.goBack() }
                ]
              );
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      } catch (err: any) {
        const status = err?.status ?? err?.response?.status;
        const body   = err?.data   ?? err?.response?.data;
        const preview = typeof body === 'string' ? body.slice(0, 200) : body;
        logE('❌ Error generando QR', { msg: err?.message, status, body: preview });
        setIsLoading(false);
        const msg =
          (typeof body === 'object' && body?.message) ? body.message :
          status ? `No se pudo generar el QR (HTTP ${status})` :
          err?.message || 'No se pudo generar el QR';
        setErrorMsg(msg);
      }
    })();

    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beneficio?.id, apiUserId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${m}:${String(s).padStart(2,'0')}`;
  };

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

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Beneficio Info */}
        <View style={styles.beneficioInfo}>
          {!!beneficio.categoria && (
            <View style={styles.categoriaTag}><Text style={styles.categoriaText}>{beneficio.categoria}</Text></View>
          )}
          <Text style={styles.comercioName}>{beneficio.comercio}</Text>
          <Text style={styles.descuentoText}>{beneficio.descuento}</Text>
        </View>

        {/* QR */}
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            {isLoading ? (
              <View style={[styles.qrPlaceholder, { width: qrSize, height: qrSize }]}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} />
                <Text style={styles.loadingText}>Generando QR...</Text>
              </View>
            ) : errorMsg ? (
              <View style={[styles.qrPlaceholder, { width: qrSize, height: qrSize }]}>
                <Ionicons name="alert-circle-outline" size={42} color={COLORS.DANGER_RED ?? '#ef4444'} />
                <Text style={styles.loadingText}>{errorMsg}</Text>
              </View>
            ) : qrValue ? (
              <View style={styles.qrWithLogo}>
                <QRCode value={qrValue} size={qrSize} color={COLORS.PRIMARY_BLACK} backgroundColor={COLORS.WHITE} />
                <View style={[styles.logoOverlay, { width: qrSize * 0.12, height: qrSize * 0.12, top: (qrSize - qrSize * 0.12)/2, left: (qrSize - qrSize * 0.12)/2 }]}>
                  <Image source={require('../../assets/cvm-escudo-para-fondo-blanco.png')} style={styles.logoImage} resizeMode="contain" />
                </View>
              </View>
            ) : null}
          </View>

          {/* Timer + botón */}
          <View style={{ alignItems: 'center', gap: 12 }}>
            <View style={styles.timerContainer}>
              <View style={styles.timerIcon}>
                <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY_GREEN} />
              </View>
              <Text style={styles.timerText}>
                Válido por: <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 16 }}
              onPress={() => (navigation as any).replace?.('QRBeneficio', { beneficio })}
            >
              <Text style={{ color: COLORS.PRIMARY_GREEN, fontWeight: '600' }}>Generar nuevo QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instrucciones */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.instructionText}>Mostrá este código al personal del comercio.</Text>
          </View>
          <View style={styles.instructionRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.instructionText}>El comercio lo escaneará y confirmará el canje.</Text>
          </View>
          <View style={styles.instructionRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.instructionText}>El QR expira automáticamente en 1 hora.</Text>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={20} color={COLORS.WARNING} />
          <Text style={styles.warningText}>Este código QR es de uso único y expira automáticamente después de 1 hora</Text>
        </View>
      </ScrollView>

      <FloatingChatBot />
    </View>
  );
}

/** ===================== Styles ===================== **/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND_SECONDARY },
  header: { backgroundColor: COLORS.PRIMARY_GREEN, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.WHITE, fontFamily: 'BarlowCondensed-Bold' },
  placeholder: { width: 40 },
  scrollContainer: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100 },
  beneficioInfo: { alignItems: 'center', marginBottom: 30 },
  categoriaTag: { backgroundColor: COLORS.PRIMARY_GREEN, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  categoriaText: { color: COLORS.WHITE, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  comercioName: { fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY, textAlign: 'center', marginBottom: 8, fontFamily: 'BarlowCondensed-Bold' },
  descuentoText: { fontSize: 16, color: COLORS.TEXT_SECONDARY, textAlign: 'center', lineHeight: 22 },
  qrContainer: { alignItems: 'center', marginBottom: 30 },
  qrWrapper: { backgroundColor: COLORS.WHITE, padding: 20, borderRadius: 20, shadowColor: COLORS.PRIMARY_BLACK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5, marginBottom: 20 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.WHITE, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 25, shadowColor: COLORS.PRIMARY_BLACK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  timerIcon: { marginRight: 8 },
  timerText: { fontSize: 14, color: COLORS.TEXT_SECONDARY },
  timerValue: { fontWeight: 'bold', color: COLORS.PRIMARY_GREEN, fontFamily: 'BarlowCondensed-Bold' },
  instructionsContainer: { marginBottom: 20 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.PRIMARY_GREEN, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepNumberText: { color: COLORS.WHITE, fontSize: 14, fontWeight: 'bold' },
  instructionText: { flex: 1, fontSize: 14, color: COLORS.TEXT_PRIMARY, lineHeight: 20 },
  warningContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF3CD', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: COLORS.WARNING },
  warningText: { flex: 1, fontSize: 13, color: '#856404', marginLeft: 12, lineHeight: 18 },
  qrPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.WHITE },
  loadingText: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 12, textAlign: 'center' },
  qrWithLogo: { position: 'relative' },
  logoOverlay: { position: 'absolute', backgroundColor: COLORS.WHITE, borderRadius: 8, justifyContent: 'center', alignItems: 'center', padding: 2 },
  logoImage: { width: '100%', height: '100%' },
});
