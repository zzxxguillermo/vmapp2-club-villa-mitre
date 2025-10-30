// Paleta de colores oficial del Club Villa Mitre
export const COLORS = {
  // Colores principales del club
  PRIMARY_GREEN: '#00973D',
  PRIMARY_BLACK: '#1D1D1B',
  
  // Variaciones del verde principal
  GREEN_LIGHT: '#00B347',
  GREEN_DARK: '#007A32',
  GREEN_LIGHTER: '#E8F5E8',
  GREEN_DARKER: '#005A26',
  
  // Variaciones del negro/gris
  BLACK_LIGHT: '#2D2D2B',
  BLACK_LIGHTER: '#4D4D4B',
  GRAY_DARK: '#666666',
  GRAY_MEDIUM: '#999999',
  GRAY_LIGHT: '#CCCCCC',
  GRAY_LIGHTER: '#E5E5E5',
  GRAY_LIGHTEST: '#F5F5F5',
  
  // Colores de sistema
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  
  // Estados de la UI
  SUCCESS: '#00973D', // Usa el verde del club
  ERROR: '#DC3545',
  WARNING: '#FFC107',
  INFO: '#17A2B8',
  // Colores de fondo
  BACKGROUND_PRIMARY: '#FFFFFF',
  BACKGROUND_SECONDARY: '#F8F9FA',
  BACKGROUND_TERTIARY: '#E8F5E8', // Verde muy claro
  
  // Colores de texto
  TEXT_PRIMARY: '#2B2D42',
  TEXT_SECONDARY: '#757575',
  TEXT_TERTIARY: '#9E9E9E',
  TEXT_LIGHT: '#FFFFFF',
  TEXT_DISABLED: '#9E9E9E',
  TEXT_ON_GREEN: '#FFFFFF',
  TEXT_ON_BLACK: '#FFFFFF',
  
  // Colores de bordes
  BORDER_LIGHT: '#E5E5E5',
  BORDER_DARK: '#999999',
  BORDER_GREEN: '#00973D',
  
  // Colores de sombras
  SHADOW_LIGHT: 'rgba(0, 0, 0, 0.1)',
  SHADOW_MEDIUM: 'rgba(0, 0, 0, 0.15)',
  SHADOW_DARK: 'rgba(0, 0, 0, 0.25)',
  SHADOW_GREEN: 'rgba(0, 151, 61, 0.2)',
} as const;

// Tipos para TypeScript
export type ColorValue = typeof COLORS[keyof typeof COLORS];

// Paleta temática para diferentes secciones
export const THEME_COLORS = {
  // Tema principal del club
  CLUB: {
    primary: COLORS.PRIMARY_GREEN,
    secondary: COLORS.PRIMARY_BLACK,
    background: COLORS.WHITE,
    surface: COLORS.BACKGROUND_TERTIARY,
  },
  
  // Tema para actividades deportivas
  SPORTS: {
    primary: COLORS.PRIMARY_GREEN,
    secondary: COLORS.GREEN_DARK,
    background: COLORS.BACKGROUND_SECONDARY,
    surface: COLORS.WHITE,
  },
  
  // Tema para beneficios y cupones
  BENEFITS: {
    primary: COLORS.PRIMARY_BLACK,
    secondary: COLORS.GRAY_DARK,
    background: COLORS.WHITE,
    surface: COLORS.GRAY_LIGHTEST,
  },
} as const;
