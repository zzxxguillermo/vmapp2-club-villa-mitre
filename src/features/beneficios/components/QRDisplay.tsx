import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';

interface QRDisplayProps {
    qrValue: string;
    isLoading: boolean;
    error: string | null;
}

export const QRDisplay: React.FC<QRDisplayProps> = React.memo(({ qrValue, isLoading, error }) => {
    const screenW = Dimensions.get('window').width;
    const qrSize = useMemo(() => Math.min(screenW * 0.7, 280), [screenW]);

    return (
        <View style={styles.qrContainer} accessibilityRole="image" accessibilityLabel="Código QR del beneficio">
            <View style={styles.qrWrapper}>
                {isLoading ? (
                    <View style={[styles.qrPlaceholder, { width: qrSize, height: qrSize }]}>
                        <ActivityIndicator size="large" color={COLORS.PRIMARY_GREEN} />
                        <Text style={styles.loadingText}>Generando QR...</Text>
                    </View>
                ) : error ? (
                    <View style={[styles.qrPlaceholder, { width: qrSize, height: qrSize }]}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={42}
                            color={COLORS.ERROR}
                        />
                        <Text style={styles.loadingText}>{error}</Text>
                    </View>
                ) : qrValue ? (
                    <View style={styles.qrWithLogo}>
                        <QRCode
                            value={qrValue}
                            size={qrSize}
                            color={COLORS.PRIMARY_BLACK}
                            backgroundColor={COLORS.WHITE}
                        />
                        <View
                            style={[
                                styles.logoOverlay,
                                {
                                    width: qrSize * 0.12,
                                    height: qrSize * 0.12,
                                    top: (qrSize - qrSize * 0.12) / 2,
                                    left: (qrSize - qrSize * 0.12) / 2,
                                },
                            ]}
                        >
                            <Image
                                source={require('../../../../assets/cvm-escudo-para-fondo-blanco.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                ) : null}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    qrContainer: { alignItems: 'center', marginBottom: 30 },
    qrWrapper: {
        backgroundColor: COLORS.WHITE,
        padding: 20,
        borderRadius: 20,
        shadowColor: COLORS.PRIMARY_BLACK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    qrPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.WHITE },
    loadingText: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 12, textAlign: 'center' },
    qrWithLogo: { position: 'relative' },
    logoOverlay: {
        position: 'absolute',
        backgroundColor: COLORS.WHITE,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    logoImage: { width: '100%', height: '100%' },
});
