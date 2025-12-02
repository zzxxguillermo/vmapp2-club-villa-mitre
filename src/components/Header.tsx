import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Logo } from './Logo';
import { Typography } from './Typography';
import { theme } from '../styles/theme';
import { COLORS } from '../constants/colors';

interface HeaderProps {
  title?: string;
  backgroundColor?: 'green' | 'dark' | 'light';
  showLogo?: boolean;
  logoSize?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  backgroundColor = 'green',
  showLogo = true,
  logoSize = 'medium',
  style,
  children,
}) => {
  const getHeaderStyle = (): ViewStyle => {
    const baseStyle =
      backgroundColor === 'green'
        ? {
            ...theme.header,
            paddingVertical: 32,
            minHeight: 95,
          }
        : backgroundColor === 'dark'
          ? theme.headerDark
          : {
              ...theme.header,
              backgroundColor: COLORS.WHITE,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.BORDER_LIGHT,
            };

    return baseStyle;
  };

  const getTextColor = () => {
    return backgroundColor === 'light' ? COLORS.TEXT_PRIMARY : COLORS.WHITE;
  };

  const getLogoBackground = (): 'light' | 'dark' | 'green' => {
    return 'light'; // Siempre logo para fondo blanco en header verde
  };

  return (
    <View style={[getHeaderStyle(), style]}>
      {showLogo && <Logo backgroundColor={getLogoBackground()} size={logoSize} />}

      {title && (
        <Typography
          variant="h2"
          style={{
            color: getTextColor(),
            flex: 1,
            textAlign: showLogo ? 'center' : 'left',
            marginLeft: showLogo ? -50 : 0, // Ajustado para mejor centrado
            fontSize: 20, // Optimizado para header
            letterSpacing: 1.2, // Espaciado entre letras mejorado
            fontWeight: 'bold',
          }}
          fontFamily="BarlowCondensed-Bold"
        >
          {title}
        </Typography>
      )}

      {children}
    </View>
  );
};
