import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { Beneficio } from '../types';
import { ImageWithLoader } from './ImageWithLoader';
import { Card } from '../../../components/Card';

const { width } = Dimensions.get('window');
const CARD_H = Math.round((width * 9) / 16);

interface BeneficioCardProps {
    beneficio: Beneficio;
    userType?: string;
    onPressQR: (beneficio: Beneficio) => void;
}

export const BeneficioCard: React.FC<BeneficioCardProps> = React.memo(({
    beneficio,
    userType,
    onPressQR,
}) => {
    return (
        <Card style={styles.card} padding="none">
            <ImageWithLoader uri={beneficio.imagenUrl} style={styles.image} />

            <View style={styles.cardBody}>
                <View style={styles.topRow}>
                    <Text style={styles.comercio} numberOfLines={2} accessibilityRole="header">
                        {beneficio.comercio}
                    </Text>
                    {!!beneficio.categoria && (
                        <View style={styles.categoryPill}>
                            <Text style={styles.categoryText}>{beneficio.categoria}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.descuento} numberOfLines={3}>
                    {beneficio.descuento || beneficio.titulo || 'Beneficio'}
                </Text>

                {!!beneficio.direccion && (
                    <View style={styles.row}>
                        <Ionicons name="location-outline" size={16} color={COLORS.GRAY_MEDIUM} />
                        <Text style={styles.muted} numberOfLines={1}>
                            {beneficio.direccion}
                        </Text>
                    </View>
                )}
                {!!beneficio.telefono && (
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Linking.openURL(`tel:${beneficio.telefono}`)}
                        accessibilityLabel={`Llamar a ${beneficio.comercio}`}
                        accessibilityRole="button"
                    >
                        <Ionicons name="call-outline" size={16} color={COLORS.GRAY_MEDIUM} />
                        <Text style={[styles.muted, styles.link]} numberOfLines={1}>
                            {beneficio.telefono}
                        </Text>
                    </TouchableOpacity>
                )}

                {userType === 'api' && (
                    <TouchableOpacity
                        style={styles.qrBtn}
                        onPress={() => onPressQR(beneficio)}
                        activeOpacity={0.85}
                        accessibilityLabel="Generar código QR"
                        accessibilityRole="button"
                    >
                        <Ionicons name="qr-code-outline" size={20} color="#fff" />
                        <Text style={styles.qrText}>Generar QR</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Card>
    );
});

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: Math.max(CARD_H, Math.min(280, Dimensions.get('window').height * 0.28)),
    },
    cardBody: { padding: 12, gap: 8 },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },
    comercio: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.PRIMARY_BLACK },
    categoryPill: {
        backgroundColor: COLORS.PRIMARY_GREEN,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    categoryText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    descuento: { marginTop: 2, fontSize: 15, color: COLORS.PRIMARY_BLACK },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    muted: { fontSize: 13, color: COLORS.GRAY_MEDIUM, flexShrink: 1 },
    link: { textDecorationLine: 'underline' },
    qrBtn: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: COLORS.PRIMARY_GREEN,
        paddingVertical: 12,
        borderRadius: 12,
    },
    qrText: { color: '#fff', fontWeight: '700' },
});
