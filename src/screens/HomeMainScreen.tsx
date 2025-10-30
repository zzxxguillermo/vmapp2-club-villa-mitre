import React from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BackgroundImage } from '../components/BackgroundImage';
import { Typography } from '../components/Typography';
import { NavigationCard } from '../components/NavigationCard';
import { FloatingChatBot } from '../components/FloatingChatBot';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/colors';
import { getCardImage } from '../constants/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeMainScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const navigateToSection = (screen: string) => {
    // Debug para verificar el tipo de usuario
    if (__DEV__) {
      console.log('🏠 HomeMain - Usuario:', user?.user_type);
      console.log('🏠 HomeMain - Navegando a:', screen);
    }

    // Permitir navegación según el tipo de usuario y pantalla
    if (user?.user_type === 'api') {
      // Usuarios API pueden acceder a todo
      // @ts-ignore - Navegación a pantallas específicas
      navigation.navigate(screen);
    } else if (user?.user_type === 'local') {
      // Usuarios locales solo pueden acceder a Red de Beneficios
      if (screen === 'MisBeneficios') {
        // @ts-ignore - Navegación a pantallas específicas
        navigation.navigate(screen);
      }
      // Para otras pantallas, no hacer nada (usuarios locales no pueden acceder)
    }
  };


  return (
    <BackgroundImage screen="home" overlay={true} overlayOpacity={0.2}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <View style={styles.textContainer}>
            <Text 
              style={styles.welcomeTitle}
              adjustsFontSizeToFit
              numberOfLines={1}
              allowFontScaling={false}
            >
              ¡Hola {(user?.nombre || user?.name || 'Usuario').split(' ')[0]}!
            </Text>
            <Text 
              style={styles.welcomeSubtitle}
              adjustsFontSizeToFit
              numberOfLines={1}
              allowFontScaling={false}
            >
              Bienvenido al Club Villa Mitre
            </Text>
          </View>
        </View>


        <View style={styles.sectionsContainer}>
          <NavigationCard
            title="Carnet Virtual"
            imageSource={getCardImage('carnet')}
            onPress={() => navigateToSection('MiCarnet')}
          />
          
          <NavigationCard
            title="Estado de Cuenta"
            imageSource={getCardImage('estado')}
            onPress={() => navigateToSection('EstadoDeCuenta')}
          />
          
          <NavigationCard
            title="Red de Beneficios"
            imageSource={getCardImage('beneficios')}
            onPress={() => navigateToSection('MisBeneficios')}
          />
        </View>
      </ScrollView>
      
      {/* ChatBot flotante */}
      <FloatingChatBot />
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  textContainer: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - 60,
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    color: COLORS.PRIMARY_BLACK,
    fontSize: 48,
    fontFamily: 'BarlowCondensed-Bold',
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: -0.5,
    width: '100%',
  },
  welcomeSubtitle: {
    color: COLORS.PRIMARY_BLACK,
    fontSize: 22,
    fontFamily: 'BarlowCondensed-Regular',
    marginTop: 0,
    width: '100%',
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
  },
});
