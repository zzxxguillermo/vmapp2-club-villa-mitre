import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../../../constants/colors';

interface ImageWithLoaderProps {
    uri: string;
    style?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}

export const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ uri, style, containerStyle }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const hasUri = typeof uri === 'string' && uri.length > 0;

    return (
        <View style={[styles.container, containerStyle]}>
            {hasUri ? (
                <>
                    {loading && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="small" color={COLORS.PRIMARY_GREEN} />
                        </View>
                    )}
                    <Image
                        source={uri}
                        style={style}
                        contentFit="cover"
                        transition={500}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                    />
                </>
            ) : (
                <View style={[style, styles.placeholder]}>
                    <Text style={styles.placeholderText}>Sin imagen</Text>
                </View>
            )}
            {error && (
                <View style={[style, styles.placeholder, styles.errorOverlay]}>
                    <Text style={styles.placeholderText}>Error al cargar</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
    },
    loaderContainer: {
        position: 'absolute',
        zIndex: 1,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#e5e7eb',
        width: '100%',
        height: '100%',
    },
    errorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    placeholderText: {
        color: '#6b7280',
        fontSize: 13,
    },
});
