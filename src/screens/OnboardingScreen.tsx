import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';

type Slide = {
  id: number;
  image: any;
  buttonText: string;
  buttonAction: 'next' | 'register';
};

const slides: Slide[] = [
  {
    id: 1,
    image: require('../../assets/Slides/1.jpeg'),
    buttonText: 'SIGUIENTE',
    buttonAction: 'next',
  },
  {
    id: 2,
    image: require('../../assets/Slides/2.jpeg'),
    buttonText: 'SIGUIENTE',
    buttonAction: 'next',
  },
  {
    id: 3,
    image: require('../../assets/Slides/3.jpeg'),
    buttonText: 'SIGUIENTE',
    buttonAction: 'next',
  },
  {
    id: 4,
    image: require('../../assets/Slides/4.jpeg'),
    buttonText: 'REGISTRARME',
    buttonAction: 'register',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Fade in inicial
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
    }
  };

  const navigateWithAnimation = (screen: 'Login' | 'Register') => {
    // Fade out antes de navegar
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0.95,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate(screen as never);
    });
  };

  const handleButtonPress = () => {
    const currentSlide = slides[currentIndex];
    
    if (currentSlide.buttonAction === 'next') {
      // Slides con "SIGUIENTE" avanzan al próximo
      scrollToNext();
    } else if (currentSlide.buttonAction === 'register') {
      // Último slide: "REGISTRARME" va al registro con animación
      navigateWithAnimation('Register');
    }
  };

  const handleSkip = () => {
    // "Omitir" va al login con animación
    navigateWithAnimation('Login');
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: slideAnim }],
        },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width, height }]}>
            {/* Imagen completa (ya tiene todos los elementos de diseño) */}
            <Image source={slide.image} style={styles.image} />
            
            {/* Contenedor inferior para controles */}
            <View style={styles.controlsContainer}>
              {/* Botón principal */}
              <TouchableOpacity
                style={[
                  styles.button,
                  slide.id === 4 && styles.buttonGreen, // Verde en último slide
                ]}
                onPress={handleButtonPress}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{slide.buttonText}</Text>
              </TouchableOpacity>

              {/* Link de Omitir */}
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Omitir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: Platform.select({ ios: 40, android: 30 }),
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: '8%',
  },
  button: {
    backgroundColor: '#2B2B2B',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 16,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonGreen: {
    backgroundColor: '#00D449',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '400',
    opacity: 0.9,
  },
});
