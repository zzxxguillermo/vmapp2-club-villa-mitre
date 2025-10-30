import { Usuario, EstadoCuenta } from '../types';

/**
 * Utility functions for mapping user data between backend and frontend formats
 */

/**
 * Maps backend user data to frontend format with legacy field compatibility
 */
export const mapBackendUserToFrontend = (backendUser: any): Usuario => {
  // Create default estado cuenta if not provided
  const defaultEstadoCuenta: EstadoCuenta = {
    alDia: true,
    cuotasAdeudadas: 0,
    montoAdeudado: 0,
    proximoVencimiento: '',
    ultimoPago: '',
    montoUltimoPago: 0,
    historialPagos: []
  };

  const mappedUser = {
    // Backend fields (as received from Laravel API)
    id: backendUser.id,
    dni: backendUser.dni,
    user_type: backendUser.user_type,
    type_label: backendUser.type_label,
    name: backendUser.name,
    display_name: backendUser.display_name,
    email: backendUser.email,
    phone: backendUser.phone,
    promotion_status: backendUser.promotion_status || 'none',
    promotion_label: backendUser.promotion_label || 'Sin promoción',
    promoted_at: backendUser.promoted_at,
    can_promote: backendUser.can_promote || false,
    is_complete: backendUser.is_complete || false,
    
    // API-specific fields (for user_type: "api")
    nombre: backendUser.nombre,
    apellido: backendUser.apellido,
    full_name: backendUser.full_name,
    nacionalidad: backendUser.nacionalidad,
    nacimiento: backendUser.nacimiento,
    domicilio: backendUser.domicilio,
    localidad: backendUser.localidad,
    telefono: backendUser.telefono,
    celular: backendUser.celular,
    categoria: backendUser.categoria,
    socio_id: backendUser.socio_id,
    socio_n: backendUser.socio_n, // Número de socio real del club
    barcode: backendUser.barcode,
    estado_socio: backendUser.estado_socio,
    api_updated_at: backendUser.api_updated_at,
    
    // Nuevos campos de la API de terceros
    saldo: backendUser.saldo ? parseFloat(backendUser.saldo) : 0,
    semaforo: backendUser.semaforo ? parseInt(backendUser.semaforo) : undefined,
    foto_url: backendUser.foto_url,
    
    created_at: backendUser.created_at,
    updated_at: backendUser.updated_at,
    
    // Legacy fields for compatibility with existing components
    fotoUrl: backendUser.foto_url || backendUser.profileImage || backendUser.image || backendUser.avatar || backendUser.photo || backendUser.picture || '',
    profileImage: backendUser.foto_url || backendUser.profileImage || backendUser.image || backendUser.avatar || backendUser.photo || backendUser.picture || '',
    nroSocio: backendUser.socio_id || backendUser.socio_n || backendUser.id?.toString() || '', // Prioridad: socio_id > socio_n > id (socio_id se usa para URLs de fotos)
    codigoBarras: backendUser.barcode || '',
    validoHasta: backendUser.api_updated_at || 
                 new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    estadoCuenta: backendUser.estadoCuenta || defaultEstadoCuenta
  };

  return mappedUser;
};

/**
 * Extracts display name for user based on available data
 */
export const getUserDisplayName = (user: Usuario): string => {
  if (user.display_name) return user.display_name;
  if (user.full_name) return user.full_name;
  if (user.nombre && user.apellido) return `${user.apellido}, ${user.nombre}`;
  if (user.name) return user.name;
  return `Usuario ${user.dni}`;
};

/**
 * Checks if user has complete profile data
 */
export const isUserProfileComplete = (user: Usuario): boolean => {
  const hasBasicInfo = !!(user.dni && user.name);
  const hasContactInfo = !!(user.email || user.phone);
  
  if (user.user_type === 'api') {
    // API users should have more complete data
    return hasBasicInfo && hasContactInfo && user.is_complete;
  }
  
  // Local users need at least basic info
  return hasBasicInfo && hasContactInfo;
};

/**
 * Gets user type label in Spanish
 */
export const getUserTypeLabel = (user: Usuario): string => {
  return user.type_label || (user.user_type === 'api' ? 'Usuario API' : 'Usuario Local');
};

/**
 * Gets promotion status label in Spanish
 */
export const getPromotionStatusLabel = (user: Usuario): string => {
  return user.promotion_label || 'Sin promoción';
};
