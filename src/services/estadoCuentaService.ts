import { EstadoCuenta } from '../types';
import { getApiBaseUrl } from '../utils/environment';

const API_BASE_URL = getApiBaseUrl();

export const estadoCuentaService = {
  // Obtener estado de cuenta del usuario actual
  async getEstadoCuenta(): Promise<EstadoCuenta> {
    try {
      const response = await fetch(`${API_BASE_URL}/estado-cuenta`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching estado de cuenta:', error);
      throw error;
    }
  },

  // Cambiar usuario para testing (simular diferentes estados)
  async cambiarUsuario(alDia: boolean): Promise<{ user: any; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/estado-cuenta/cambiar-usuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alDia }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cambiando usuario:', error);
      throw error;
    }
  },
};
