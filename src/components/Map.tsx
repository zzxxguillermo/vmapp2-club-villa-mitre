import React, { Suspense } from 'react';
import { Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Use a standard dynamic import for web, and a direct require for native
// This avoids Suspense issues on native and fixes the web bundling error.
const MapComponent =
  Platform.OS === 'web' ? React.lazy(() => import('./MapWeb')) : require('./MapNative').default;

type Local = {
  id: string;
  nombre: string;
  latitude: number;
  longitude: number;
};

interface MapProps {
  locales: Local[];
}

const LoadingFallback = () => (
  <View style={styles.fallback}>
    <ActivityIndicator />
    <Text style={{ marginTop: 10 }}>Cargando mapa...</Text>
  </View>
);

export default function Map(props: MapProps) {
  if (Platform.OS === 'web') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <MapComponent {...props} />
      </Suspense>
    );
  }

  // On native, MapComponent is already loaded via require, so we can render it directly.
  return <MapComponent {...props} />;
}

const styles = StyleSheet.create({
  fallback: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
});
