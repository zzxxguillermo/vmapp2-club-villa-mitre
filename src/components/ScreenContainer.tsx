import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BackgroundImage } from './BackgroundImage';
import { Header } from './Header';
import { theme } from '../styles/theme';

interface ScreenContainerProps {
  screen?: 'login' | 'home';
  useBackground?: boolean;
  backgroundOverlay?: boolean;
  headerTitle?: string;
  headerBackgroundColor?: 'green' | 'dark' | 'light';
  showHeader?: boolean;
  showLogo?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  screen,
  useBackground = false,
  backgroundOverlay = false,
  headerTitle,
  headerBackgroundColor = 'green',
  showHeader = false,
  showLogo = true,
  style,
  children,
}) => {
  const containerStyle: ViewStyle = {
    ...theme.container,
    ...style,
  };

  if (useBackground && screen) {
    return (
      <BackgroundImage screen={screen} overlay={backgroundOverlay} style={containerStyle}>
        {showHeader && (
          <Header title={headerTitle} backgroundColor={headerBackgroundColor} showLogo={showLogo} />
        )}
        <View style={{ flex: 1 }}>{children}</View>
      </BackgroundImage>
    );
  }

  return (
    <View style={containerStyle}>
      {showHeader && (
        <Header title={headerTitle} backgroundColor={headerBackgroundColor} showLogo={showLogo} />
      )}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};
