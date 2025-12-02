// Sistema de imágenes del Club Villa Mitre
export const IMAGES = {
  // Logos adaptativos
  LOGO_WHITE_BG: require('../../assets/cvm-escudo-para-fondo-blanco.png'),
  LOGO_BLACK_BG: require('../../assets/cvm-escudo-para-fondo-negro.png'),

  // Backgrounds
  BACKGROUND_LOGIN: require('../../assets/app_cvm_fondo_login.jpg'),
  BACKGROUND_HOME: require('../../assets/app_cvm_fondo_home.jpg'),

  // Iconos de la app
  ICON: require('../../assets/icon.png'),
  ADAPTIVE_ICON: require('../../assets/adaptive-icon.png'),
  SPLASH_ICON: require('../../assets/splash-icon.png'),
  FAVICON: require('../../assets/favicon.png'),
} as const;

// Función para obtener el logo apropiado según el fondo
export const getLogoForBackground = (backgroundColor: 'light' | 'dark' | 'green') => {
  switch (backgroundColor) {
    case 'light':
      return IMAGES.LOGO_WHITE_BG; // Logo para fondo blanco
    case 'dark':
    case 'green':
      return IMAGES.LOGO_BLACK_BG; // Logo para fondo negro/verde
    default:
      return IMAGES.LOGO_WHITE_BG;
  }
};

// Función para obtener el background apropiado según la pantalla
export const getBackgroundImage = (screen: 'login' | 'home') => {
  switch (screen) {
    case 'login':
      return require('../../assets/app_cvm_fondo_login.jpg');
    case 'home':
      return require('../../assets/app_cvm_fondo_home.jpg');
    default:
      return require('../../assets/app_cvm_fondo_home.jpg');
  }
};

// Imágenes para las tarjetas del Home
export const getCardImage = (card: 'carnet' | 'estado' | 'beneficios') => {
  switch (card) {
    case 'carnet':
      return require('../../assets/images/carnet_virtual.jpg');
    case 'estado':
      return require('../../assets/images/estado_de_cuenta.jpg');
    case 'beneficios':
      return require('../../assets/images/beneficios.jpg');
    default:
      return require('../../assets/app_cvm_fondo_home.jpg');
  }
};
