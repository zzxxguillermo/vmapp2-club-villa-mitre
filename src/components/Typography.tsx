import React from 'react';
import { Text, TextProps } from 'react-native';
import { typography } from '../styles/typography';

interface TypographyProps extends TextProps {
  variant?: keyof typeof typography;
  children: React.ReactNode;
  fontFamily?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  style,
  children,
  fontFamily,
  ...props
}) => {
  const customStyle = fontFamily ? { fontFamily } : {};
  return (
    <Text style={[typography[variant], customStyle, style]} {...props}>
      {children}
    </Text>
  );
};

// Componentes específicos para cada variante
export const H1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" {...props} />
);

export const H2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" {...props} />
);

export const H3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" {...props} />
);

export const Body = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body" {...props} />
);

export const BodySmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodySmall" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

// Variantes condensadas
export const H1Condensed = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1Condensed" {...props} />
);

export const H2Condensed = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2Condensed" {...props} />
);

export const BodyCondensed = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodyCondensed" {...props} />
);

// Variantes semi-condensadas
export const H1SemiCondensed = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1SemiCondensed" {...props} />
);

export const H2SemiCondensed = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2SemiCondensed" {...props} />
);

export const BodySemiCondensed = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="bodySemiCondensed" {...props} />
);
