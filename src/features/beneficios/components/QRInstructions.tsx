import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';

export const QRInstructions: React.FC = () => {
    return (
        <View style={styles.instructionsContainer}>
            <View style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>Mostrá este código al personal del comercio.</Text>
            </View>
            <View style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                    El comercio lo escaneará y confirmará el canje.
                </Text>
            </View>
            <View style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>El QR expira automáticamente en 1 hora.</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    instructionsContainer: { marginBottom: 20 },
    instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.PRIMARY_GREEN,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: { color: COLORS.WHITE, fontSize: 14, fontWeight: 'bold' },
    instructionText: { flex: 1, fontSize: 14, color: COLORS.TEXT_PRIMARY, lineHeight: 20 },
});
