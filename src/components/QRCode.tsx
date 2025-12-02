// components/QRCode.tsx
import React from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';

interface QRCodeProps {
  data: string;
  size: number;
  backgroundColor?: string;
  foregroundColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  style?: any;
  showLabel?: boolean;
  label?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  data,
  size,
  backgroundColor = 'ffffff',
  foregroundColor = '000000',
  errorCorrectionLevel = 'M',
  style,
  showLabel = false,
  label,
}) => {
  // Generate QR code URL with enhanced parameters
  const generateQRUrl = () => {
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({
      size: `${size}x${size}`,
      data: encodeURIComponent(data),
      bgcolor: backgroundColor,
      color: foregroundColor,
      ecc: errorCorrectionLevel,
      format: 'png',
      margin: '10',
    });

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: generateQRUrl() }}
        style={[styles.qrImage, { width: size, height: size }]}
        resizeMode="contain"
        accessibilityLabel={`Código QR: ${data}`}
      />
      {showLabel && label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

// Specialized QR for Club Villa Mitre carnet
export const CarnetQRCode: React.FC<{
  dni: string;
  nombre: string;
  apellido: string;
  nroSocio: string;
  size: number;
  style?: any;
}> = ({ dni, nombre, apellido, nroSocio, size, style }) => {
  // Use DNI as the primary QR data for simplicity and clarity
  const qrData = dni;

  return (
    <View style={[styles.carnetQrContainer, style]}>
      <View style={styles.qrWithLogo}>
        <Image
          source={{ uri: generateQRUrl(qrData, size) }}
          style={[styles.qrImage, { width: size, height: size }]}
          resizeMode="contain"
          accessibilityLabel={`Código QR: ${qrData}`}
        />
        <View
          style={[
            styles.logoOverlay,
            {
              width: size * 0.12,
              height: size * 0.12,
              top: (size - size * 0.12) / 2,
              left: (size - size * 0.12) / 2,
            },
          ]}
        >
          <Image
            source={require('../../assets/cvm-escudo-para-fondo-blanco.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

// Helper function to generate QR URL
const generateQRUrl = (data: string, size: number) => {
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: encodeURIComponent(data),
    bgcolor: 'ffffff',
    color: '000000',
    ecc: 'H',
    format: 'png',
    margin: '10',
  });

  return `${baseUrl}?${params.toString()}`;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  carnetQrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWithLogo: {
    position: 'relative',
  },
  logoOverlay: {
    position: 'absolute',
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});
