import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Animated,
  Linking,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { COLORS } from '../constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingChatBotProps {
  initialPosition?: { x: number; y: number };
}

export const FloatingChatBot: React.FC<FloatingChatBotProps> = ({
  initialPosition = { x: screenWidth - 80, y: screenHeight - 200 }
}) => {
  const [position, setPosition] = useState(initialPosition);
  const translateX = useRef(new Animated.Value(initialPosition.x)).current;
  const translateY = useRef(new Animated.Value(initialPosition.y)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, translationY } = event.nativeEvent;
      
      // Calcular nueva posición
      let newX = position.x + translationX;
      let newY = position.y + translationY;

      // Límites de la pantalla con margen
      const margin = 30;
      const botSize = 60;
      
      newX = Math.max(margin, Math.min(screenWidth - botSize - margin, newX));
      newY = Math.max(margin, Math.min(screenHeight - botSize - margin, newY));

      // Actualizar posición
      setPosition({ x: newX, y: newY });

      // Animar a la nueva posición
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: newX,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(translateY, {
          toValue: newY,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  };

  const handlePress = async () => {
    // Animación de presión
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();

    // Abrir WhatsApp
    const whatsappUrl = 'https://wa.me/+5492915207677';
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp no disponible',
          'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo abrir el enlace de WhatsApp',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/logo-chatbot.png')}
            style={styles.botImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY_BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY_BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: COLORS.PRIMARY_GREEN,
    overflow: 'hidden',
  },
  botImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
