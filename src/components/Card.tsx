import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';
import { COLORS } from '../constants/colors';

interface CardProps extends ViewProps {
  variant?: 'default' | 'green' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  style,
  children,
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = variant === 'green' ? theme.cardGreen : theme.card;

    const paddingStyle = {
      none: { padding: 0 },
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
    }[padding];

    const elevationStyle =
      variant === 'elevated'
        ? {
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }
        : {};

    return {
      ...baseStyle,
      ...paddingStyle,
      ...elevationStyle,
    };
  };

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};
