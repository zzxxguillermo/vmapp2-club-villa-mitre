// Mapeo de imágenes de actividades deportivas
// Usando imágenes copiadas a assets/images/ con extensiones consistentes
export const ACTIVITY_IMAGES = {
  BASKET: require('../../assets/images/basket.jpg'),
  BOXEO: require('../../assets/images/boxeo.jpg'),
  FUTBOL_FEMENINO: require('../../assets/images/futbol_femenino.jpg'),
  FUTBOL: require('../../assets/images/futbol.jpg'),
  FUTSAL: require('../../assets/images/futsal.jpg'),
  GIMNASIA_ARTISTICA: require('../../assets/images/gimnasia_artistica.jpg'),
  HOCKEY: require('../../assets/images/hockey_(1).jpg'),
  HOCKEY_PATINES: require('../../assets/images/hockey_sobre_patines.jpg'),
  KARATE: require('../../assets/images/karate.jpg'),
  PATIN: require('../../assets/images/patin.jpg'),
  VOLEY: require('../../assets/images/voley.jpg'),
};

// Función para obtener imagen por nombre de actividad
export const getActivityImage = (activityName: string) => {
  const normalizedName = activityName.toLowerCase().replace(/\s+/g, '_');

  switch (normalizedName) {
    case 'basket':
    case 'basquet':
    case 'básquet':
      return ACTIVITY_IMAGES.BASKET;
    case 'boxeo':
      return ACTIVITY_IMAGES.BOXEO;
    case 'futbol_femenino':
    case 'fútbol_femenino':
      return ACTIVITY_IMAGES.FUTBOL_FEMENINO;
    case 'futbol':
    case 'fútbol':
      return ACTIVITY_IMAGES.FUTBOL;
    case 'futsal':
      return ACTIVITY_IMAGES.FUTSAL;
    case 'gimnasia_artistica':
    case 'gimnasia_artística':
      return ACTIVITY_IMAGES.GIMNASIA_ARTISTICA;
    case 'hockey':
      return ACTIVITY_IMAGES.HOCKEY;
    case 'hockey_sobre_patines':
    case 'hockey_patines':
      return ACTIVITY_IMAGES.HOCKEY_PATINES;
    case 'karate':
      return ACTIVITY_IMAGES.KARATE;
    case 'patin':
    case 'patín':
      return ACTIVITY_IMAGES.PATIN;
    case 'voley':
    case 'vóley':
      return ACTIVITY_IMAGES.VOLEY;
    default:
      return ACTIVITY_IMAGES.FUTBOL; // Imagen por defecto
  }
};
