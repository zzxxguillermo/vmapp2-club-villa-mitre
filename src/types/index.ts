
// ===== INTERFACES PRINCIPALES =====

// Estado de cuenta del socio
export interface EstadoCuenta {
  alDia: boolean;
  cuotasAdeudadas: number;
  montoAdeudado: number;
  proximoVencimiento: string;
  ultimoPago: string;
  montoUltimoPago: number;
  historialPagos: HistorialPago[];
}

export interface HistorialPago {
  id: string;
  fecha: string;
  monto: number;
  concepto: string;
  metodoPago: string;
}

// Usuario/Socio del club - Adaptado al backend Laravel
export interface Usuario {
  id: number;
  dni: string;
  user_type: "local" | "api";
  type_label?: string;
  name: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  promotion_status: "none" | "pending" | "approved" | "rejected";
  promotion_label: string;
  promoted_at: string | null;
  can_promote: boolean;
  is_complete: boolean;
  
  // Campos específicos de socios (solo para user_type: "api")
  nombre?: string;
  apellido?: string;
  full_name?: string;
  nacionalidad?: string;
  nacimiento?: string;
  domicilio?: string;
  localidad?: string;
  telefono?: string;
  celular?: string;
  categoria?: string;
  socio_id?: string; // ID de socio del club (usado para URLs de fotos)
  socio_n?: string; // Número de socio real del club
  barcode?: string;
  estado_socio?: string;
  api_updated_at?: string;
  
  // Nuevos campos de la API de terceros
  saldo?: number;
  semaforo?: number; // 1 = Al día, 99 = Con deuda exigible, 10 = Con deuda no exigible
  foto_url?: string;
  
  created_at: string;
  updated_at: string;
  
  // Campos legacy para compatibilidad con componentes existentes
  fotoUrl?: string;
  profileImage?: string;
  nroSocio?: string; // Mapea a socio_id
  validoHasta?: string; // Calculado o por defecto
  codigoBarras?: string; // Mapea a barcode
  estadoCuenta?: EstadoCuenta; // Se mantiene para compatibilidad
}

// Actividades deportivas del club
export interface Actividad {
  id: string;
  icono: string;
  titulo: string;
  detalle: string;
  contacto: string;
  imagenUrl: string;
}

// Beneficios/Áreas del club
export interface Beneficio {
  id: string;
  titulo: string;
  detalle: string;
  contacto?: string;
  imagenUrl: string;
}

// Cupones de descuento
export type CategoriasCupon = 'Alimentos' | 'Entretenimiento' | 'Moda';

export interface Cupon {
  id: string;
  titulo: string;
  descripcion: string;
  validoHasta: string;
  categoria: CategoriasCupon;
  imagenUrl: string;
}

// Sistema de puntos
export interface PuntosData {
  puntosTotales: number;
  puntosObtenidos: number;
  puntosGastados: number;
  historialMensual: number[];
}

// Locales/Ubicaciones para mapas
export interface Local {
  id: string;
  nombre: string;
  latitude: number;
  longitude: number;
}

// ===== TIPOS DE ESTADO =====

// Estado de autenticación
export interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Estado genérico para listas con loading
export interface BaseListState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
}

// Estado específico para cupones (con filtro de categoría)
export interface CuponesState extends BaseListState<Cupon> {
  categoriaSeleccionada: string | null;
}

// Estado para puntos
export interface PuntosState {
  data: PuntosData | null;
  loading: boolean;
  error: string | null;
}

// ===== ROOT STATE =====
export interface RootState {
  auth: AuthState;
  actividades: BaseListState<Actividad>;
  actividadesClub: BaseListState<Actividad>;
  beneficios: BaseListState<Beneficio>;
  cupones: CuponesState;
  puntos: PuntosState;
  locales: BaseListState<Local>;
  estadoCuenta: {
    data: EstadoCuenta | null;
    loading: boolean;
    error: string | null;
  };
}

// ===== TIPOS DE API RESPONSES =====
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface LoginRequest {
  dni: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: Usuario;
    fetched_from_api: boolean;
    refreshed: boolean;
    message?: string;
  } | null;
  message: string;
}

export interface RegisterRequest {
  dni: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook';
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    token: string;
    user: Usuario;
    fetched_from_api: boolean;
    refreshed: boolean;
    message?: string;
  } | null;
  message: string;
}

// ===== NAVIGATION TYPES =====
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

export type DrawerParamList = {
  Actividades: undefined;
  MisBeneficios: undefined;
  MisCupones: undefined;
  EstadoDeCuenta: undefined;
  MiCarnet: undefined;
};

export type CuponesStackParamList = {
  ListaCupones: undefined;
  DetalleCupon: { cupon: Cupon };
};
