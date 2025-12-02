import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/providers/AppProvider';
import { useAuth } from './src/features/auth/hooks/useAuth';
import { RootStackParamList } from './src/types';
import OnboardingScreen from './src/features/auth/screens/OnboardingScreen';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import RegisterScreen from './src/features/auth/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  // Determinar la pantalla inicial
  // Si está autenticado → Home, sino → Onboarding (siempre)
  const getInitialRoute = (): keyof RootStackParamList => {
    if (isAuthenticated) return 'Home';
    return 'Onboarding';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={getInitialRoute()} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
