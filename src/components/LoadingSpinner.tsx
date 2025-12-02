import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';

interface LoadingSpinnerProps {
    visible?: boolean;
    text?: string;
    size?: 'small' | 'large';
    color?: string;
    overlay?: boolean;
    style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    visible = true,
    text,
    size = 'large',
    color = COLORS.PRIMARY_GREEN,
    overlay = false,
    style,
}) => {
    if (!visible) return null;

    if (overlay) {
        return (
            <View style={[styles.overlay, style]}>
                <View style={styles.container}>
                    <ActivityIndicator size={size} color={color} />
                    {text && <Text style={styles.text}>{text}</Text>}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        marginTop: 10,
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        fontWeight: '500',
    },
});
