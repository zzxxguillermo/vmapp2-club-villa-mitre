// components/CarnetFit.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Logo } from './Logo';
import { CarnetQRCode } from './QRCode';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  nombre: string;
  apellido: string;
  dni: string;
  nroSocio: string;
  fotoUrl: string;
  validoHasta: string;
  codigoBarras?: string;
  maxWidth: number;
  maxHeight: number;
};

const barcodeUrl = (value: string, scale = 3, height = 12) =>
  `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(
    value
  )}&scale=${scale}&height=${height}&includetext&textxalign=center&backgroundcolor=ffffff`;

const DESIGN_W = 540;
const DESIGN_H = 860;
const QR_SIZE = 220;
const GAP = 12;

export default function CarnetFit({
  nombre,
  apellido,
  dni,
  nroSocio,
  fotoUrl,
  validoHasta,
  codigoBarras,
  maxWidth,
  maxHeight,
}: Props) {
  if (!(maxWidth > 0 && maxHeight > 0)) return null;

  const isLandscape = maxWidth > maxHeight;
  const barcodeVal = codigoBarras?.trim() || dni.trim();

  // --- MODO PORTRAIT (vertical sin rotar): "fit" completo ---
  if (!isLandscape) {
    const scale = Math.min(maxWidth / DESIGN_W, maxHeight / DESIGN_H);
    return (
      <View style={[styles.outer, { width: DESIGN_W * scale, height: DESIGN_H * scale }]}>
        <View
          style={[styles.cardShadow, { width: DESIGN_W, height: DESIGN_H, transform: [{ scale }] }]}
        >
          <CardInner
            nombre={nombre}
            apellido={apellido}
            dni={dni}
            nroSocio={nroSocio}
            fotoUrl={fotoUrl}
            validoHasta={validoHasta}
            barcodeVal={barcodeVal}
          />
        </View>
      </View>
    );
  }

  // --- MODO LANDSCAPE: rota SOLO el carnet 90° para USAR TODA LA PANTALLA ---
  // Escala para encajar (tras rotar, el bounding del carnet es DESIGN_H x DESIGN_W)
  const scale = Math.min(maxWidth / DESIGN_H, maxHeight / DESIGN_W);

  return (
    <View style={[styles.outer, { width: DESIGN_H * scale, height: DESIGN_W * scale }]}>
      {/* Lienzo que coincide con el tamaño del carnet una vez rotado */}
      <View style={[styles.rotator, { width: DESIGN_H, height: DESIGN_W, transform: [{ scale }] }]}>
        {/* La tarjeta real (vertical) rota 90° */}
        <View style={{ width: DESIGN_W, height: DESIGN_H, transform: [{ rotate: '90deg' }] }}>
          <View style={[styles.cardShadow, { width: DESIGN_W, height: DESIGN_H }]}>
            <CardInner
              nombre={nombre}
              apellido={apellido}
              dni={dni}
              nroSocio={nroSocio}
              fotoUrl={fotoUrl}
              validoHasta={validoHasta}
              barcodeVal={barcodeVal}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

/* ----- UI interna de la tarjeta (vertical de diseño) ----- */
function CardInner({
  nombre,
  apellido,
  dni,
  nroSocio,
  fotoUrl,
  validoHasta,
  barcodeVal,
}: {
  nombre: string;
  apellido: string;
  dni: string;
  nroSocio: string;
  fotoUrl: string;
  validoHasta: string;
  barcodeVal: string;
}) {
  // ========================================
  // 📸 MANEJO DE ERROR DE CARGA DE IMAGEN
  // ========================================
  // Estado para controlar si la imagen falló al cargar
  // Si falla, mostramos un placeholder con ícono
  // ========================================
  const [imageError, setImageError] = useState(false);

  // Placeholder URL - imagen genérica de avatar
  const PLACEHOLDER_IMAGE =
    'https://ui-avatars.com/api/?name=' +
    encodeURIComponent(nombre + '+' + apellido) +
    '&background=00973D&color=fff&size=400&bold=true';

  return (
    <View style={styles.card}>
      {/* Barra de marca con logo local */}
      <View style={styles.brandBar}>
        <Logo backgroundColor="dark" size="small" style={styles.brandLogo} />
        <Text style={styles.brandText}>CLUB VILLA MITRE</Text>
      </View>

      {/* Foto + datos */}
      <View style={styles.row}>
        {!imageError ? (
          <Image
            source={{ uri: fotoUrl }}
            style={styles.photo}
            resizeMode="cover"
            onLoad={() => {
              if (__DEV__) {
                console.log('✅ Carnet: Image loaded successfully');
                console.log('🌐 URL:', fotoUrl);
              }
            }}
            onError={(error) => {
              if (__DEV__) {
                console.log('❌ Carnet: Image failed to load');
                console.log('🌐 URL intentada:', fotoUrl);
                console.log('⚠️ Error:', error.nativeEvent.error);
                console.log('🔄 Usando placeholder');
              }
              setImageError(true);
            }}
          />
        ) : (
          // Fallback: Mostrar placeholder con iniciales
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Image source={{ uri: PLACEHOLDER_IMAGE }} style={styles.photo} resizeMode="cover" />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {nombre} {apellido}
          </Text>
          <Text style={styles.nroSocio}>Nro Socio: {nroSocio}</Text>
          <Text style={styles.dni}>DNI: {dni}</Text>
        </View>
      </View>

      {/* Código de barras centrado y más grande */}
      <View style={styles.barcodeSection}>
        <View style={styles.barcodeBoxCentered}>
          <Image
            source={{ uri: barcodeUrl(barcodeVal, 3, 12) }}
            style={styles.barcodeImgLarge}
            resizeMode="contain"
            accessibilityLabel="Código de barras"
          />
        </View>
      </View>

      {/* QR Code centrado y grande debajo del código de barras */}
      <View style={styles.qrSection}>
        <View style={styles.qrContainerLarge}>
          <CarnetQRCode
            dni={dni}
            nombre={nombre}
            apellido={apellido}
            nroSocio={nroSocio}
            size={240}
            style={styles.qrCodeLarge}
          />
        </View>
      </View>
    </View>
  );
}

/* ----- Estilos ----- */
const GREEN = '#00973D'; // Verde más vibrante como en la imagen
const BORDER = '#E6EBE8';

const styles = StyleSheet.create({
  outer: { alignItems: 'center', justifyContent: 'center' },

  rotator: { alignItems: 'center', justifyContent: 'center' },

  cardShadow: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 14,
    borderRadius: 22,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },

  brandBar: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandLogo: { width: 44, height: 44, marginRight: 10 },
  brandText: { color: '#E9F6EC', fontWeight: '900', letterSpacing: 1, fontSize: 16 },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  photo: {
    width: 180,
    height: 220,
    borderRadius: 14,
    borderColor: '#FFFFFF',
    borderWidth: 3,
    backgroundColor: '#123',
  },
  photoPlaceholder: {
    backgroundColor: '#E6EBE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1, marginLeft: 14 },
  name: { color: '#101418', fontSize: 26, fontWeight: '900' },
  nroSocio: { marginTop: 6, color: '#2A2F35', fontSize: 16, fontWeight: '600' },
  dni: { marginTop: 4, color: '#2A2F35', fontSize: 16, fontWeight: '600' },
  valid: { marginTop: 2, color: '#55606B', fontSize: 14 },

  // Nuevos estilos para código de barras centrado
  barcodeSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  barcodeBoxCentered: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  },
  barcodeImgLarge: {
    width: '100%',
    height: 80,
  },
  barcodeNumberLarge: {
    fontSize: 14,
    color: '#2A2F35',
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 1,
  },

  // Nuevos estilos para QR centrado y grande
  qrSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  qrContainerLarge: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAF8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: 280,
    height: 280,
  },
  qrCodeLarge: {
    width: '100%',
    height: '100%',
  },

  // Estilos antiguos mantenidos para compatibilidad
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: GAP,
  },
  qrContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F8FAF8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrCode: { width: '100%', height: '100%' },
  qrCaptionWrap: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  qrCaption: {
    color: '#1E2A20',
    fontSize: 12,
    opacity: 0.85,
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 6,
    borderRadius: 6,
  },

  barcodeSide: { flex: 1, justifyContent: 'center' },
  barcodeBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeImg: { width: '100%', height: 60 },
  barcodeNumber: {
    fontSize: 12,
    color: '#2A2F35',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});
