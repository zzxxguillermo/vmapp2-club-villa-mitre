import { apiClient } from '../../../services/api';
import { Actividad } from '../../../types';

export class ActividadesService {
  async getAll(): Promise<Actividad[]> {
    if (__DEV__) {
      console.log('🔄 ActividadesService: getAll() called');
    }
    try {
      const result = await apiClient.get<Actividad[]>('/actividades');
      if (__DEV__) {
        console.log('✅ ActividadesService: getAll() returned', result.length, 'actividades');
      }
      return result;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ ActividadesService: getAll() failed:', error);
      }
      throw error;
    }
  }

  async getById(id: string): Promise<Actividad> {
    if (__DEV__) {
      console.log('🔄 ActividadesService: getById() called with id:', id);
    }
    try {
      const result = await apiClient.get<Actividad>(`/actividades/${id}`);
      if (__DEV__) {
        console.log('✅ ActividadesService: getById() returned:', result.titulo);
      }
      return result;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ ActividadesService: getById() failed:', error);
      }
      throw error;
    }
  }
}

export const actividadesService = new ActividadesService();
