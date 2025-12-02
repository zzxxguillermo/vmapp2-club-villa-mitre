import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../styles/theme';
import { COLORS } from '../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'dark';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  disabled,
  ...props
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle =
      variant === 'primary'
        ? theme.buttonPrimary
        : variant === 'secondary'
          ? theme.buttonSecondary
          : theme.buttonDark;

    const sizeStyle = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 24 },
      large: { paddingVertical: 16, paddingHorizontal: 32 },
    }[size];

    return {
      ...baseStyle,
      ...sizeStyle,
      ...(fullWidth && { width: '100%' }),
      ...(disabled && theme.disabled),
    };
  };

  const getTextStyle = (): TextStyle => {
    const color = variant === 'primary' || variant === 'dark' ? COLORS.WHITE : COLORS.PRIMARY_GREEN;

    const fontSize = {
      small: 14,
      medium: 16,
      large: 18,
    }[size];

    return {
      color,
      fontSize,
      fontWeight: '600',
      textAlign: 'center',
    };
  };

  return (
    <TouchableOpacity style={[getButtonStyle(), style]} disabled={disabled} {...props}>
      <Typography style={getTextStyle()}>{title}</Typography>
    </TouchableOpacity>
  );
};
