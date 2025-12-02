import React from 'react';
import { Image, ImageProps, ImageStyle } from 'react-native';
import { getLogoForBackground } from '../constants/images';

interface LogoProps extends Omit<ImageProps, 'source'> {
  backgroundColor?: 'light' | 'dark' | 'green';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export const Logo: React.FC<LogoProps> = ({
  backgroundColor = 'light',
  size = 'medium',
  style,
  ...props
}) => {
  const logoSource = getLogoForBackground(backgroundColor);

  const getSizeStyle = (): ImageStyle => {
    const sizes = {
      small: { width: 40, height: 40 },
      medium: { width: 60, height: 60 },
      large: { width: 80, height: 80 },
      xlarge: { width: 120, height: 120 },
    };

    return {
      ...sizes[size],
      resizeMode: 'contain',
    };
  };

  return <Image source={logoSource} style={[getSizeStyle(), style]} {...props} />;
};
