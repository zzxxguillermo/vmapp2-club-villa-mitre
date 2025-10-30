import { StyleSheet } from 'react-native';
import { COLORS, THEME_COLORS } from '../constants/colors';

// Estilos base del tema
export const theme = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_PRIMARY,
  },
  
  containerSecondary: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  },
  
  // Cards y superficies
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: COLORS.SHADOW_MEDIUM,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardGreen: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: COLORS.SHADOW_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Botones
  buttonPrimary: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonSecondary: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonDark: {
    backgroundColor: COLORS.PRIMARY_BLACK,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Inputs
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT_PRIMARY,
  },
  
  inputFocused: {
    borderColor: COLORS.PRIMARY_GREEN,
    borderWidth: 2,
  },
  
  // Headers y navegación
  header: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingTop: 50, // Aumentado para status bar + espacio
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 100,
  },
  
  headerDark: {
    backgroundColor: COLORS.PRIMARY_BLACK,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Separadores
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER_LIGHT,
    marginVertical: 16,
  },
  
  dividerThick: {
    height: 2,
    backgroundColor: COLORS.BORDER_DARK,
    marginVertical: 20,
  },
  
  // Estados de elementos
  disabled: {
    opacity: 0.6,
  },
  
  selected: {
    backgroundColor: COLORS.GREEN_LIGHTER,
    borderColor: COLORS.PRIMARY_GREEN,
  },
  
  // Overlays y modales
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modal: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: '80%',
  },
});

// Colores específicos por sección
export const sectionColors = {
  actividades: THEME_COLORS.SPORTS,
  beneficios: THEME_COLORS.BENEFITS,
  club: THEME_COLORS.CLUB,
} as const;
