import React from 'react';
import { ImageBackground, ImageBackgroundProps, ViewStyle, View, StyleSheet } from 'react-native';
import { getBackgroundImage } from '../constants/images';

interface BackgroundImageProps extends Omit<ImageBackgroundProps, 'source'> {
  screen: 'login' | 'home';
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  screen,
  overlay = false,
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  overlayOpacity = 0.3,
  style,
  children,
  ...props
}) => {
  const backgroundSource = getBackgroundImage(screen);

  if (!backgroundSource) {
    return null;
  }

  const containerStyle: ViewStyle = {
    flex: 1,
    ...(style as ViewStyle),
  };

  const overlayStyle: ViewStyle = overlay
    ? {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: overlayColor,
        opacity: overlayOpacity,
      }
    : {};

  return (
    <ImageBackground source={backgroundSource} style={containerStyle} resizeMode="cover" {...props}>
      {overlay && <View style={overlayStyle} />}
      {children}
    </ImageBackground>
  );
};
