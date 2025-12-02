// Configuración de tipografías Barlow para la app
export const FONTS = {
  // Barlow Regular
  BARLOW_REGULAR: 'Barlow-Regular',
  BARLOW_MEDIUM: 'Barlow-Medium',
  BARLOW_SEMIBOLD: 'Barlow-SemiBold',
  BARLOW_BOLD: 'Barlow-Bold',

  // Barlow Condensed
  BARLOW_CONDENSED_REGULAR: 'BarlowCondensed-Regular',
  BARLOW_CONDENSED_MEDIUM: 'BarlowCondensed-Medium',
  BARLOW_CONDENSED_SEMIBOLD: 'BarlowCondensed-SemiBold',
  BARLOW_CONDENSED_BOLD: 'BarlowCondensed-Bold',

  // Barlow Semi Condensed
  BARLOW_SEMI_CONDENSED_REGULAR: 'BarlowSemiCondensed-Regular',
  BARLOW_SEMI_CONDENSED_MEDIUM: 'BarlowSemiCondensed-Medium',
  BARLOW_SEMI_CONDENSED_SEMIBOLD: 'BarlowSemiCondensed-SemiBold',
  BARLOW_SEMI_CONDENSED_BOLD: 'BarlowSemiCondensed-Bold',
} as const;

// Tipos para TypeScript
export type FontFamily = (typeof FONTS)[keyof typeof FONTS];

// Configuración de tamaños de texto
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 32,
} as const;

// Configuración de pesos de texto
export const FONT_WEIGHTS = {
  REGULAR: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
} as const;
