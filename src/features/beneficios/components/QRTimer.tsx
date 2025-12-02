import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';

interface QRTimerProps {
    timeRemaining: number;
    onRefresh: () => void;
}

export const QRTimer: React.FC<QRTimerProps> = React.memo(({ timeRemaining, onRefresh }) => {
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h > 0
            ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <View style={{ alignItems: 'center', gap: 12 }}>
            <View style={styles.timerContainer} accessibilityRole="timer" accessibilityLabel={`Tiempo restante: ${formatTime(timeRemaining)}`}>
                <View style={styles.timerIcon}>
                    <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY_GREEN} />
                </View>
                <Text style={styles.timerText}>
                    Válido por: <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
                </Text>
            </View>

            <TouchableOpacity
                style={{ paddingVertical: 10, paddingHorizontal: 16 }}
                onPress={onRefresh}
                accessibilityRole="button"
                accessibilityLabel="Generar nuevo código QR"
            >
                <Text style={{ color: COLORS.PRIMARY_GREEN, fontWeight: '600' }}>
                    Generar nuevo QR
                </Text>
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: COLORS.PRIMARY_BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timerIcon: { marginRight: 8 },
    timerText: { fontSize: 14, color: COLORS.TEXT_SECONDARY },
    timerValue: {
        fontWeight: 'bold',
        color: COLORS.PRIMARY_GREEN,
        fontFamily: 'BarlowCondensed-Bold',
    },
});
