import { apiClient } from './api';

// Types para el sistema de promociones
export interface PromotionEligibility {
  eligible: boolean;
  can_request: boolean;
  reason?: string;
  requirements?: string[];
}

export interface DNICheckRequest {
  dni: string;
}

export interface DNICheckResponse {
  exists: boolean;
  valid: boolean;
  message: string;
}

export interface PromotionRequest {
  reason: string;
  additional_info?: string;
  club_password: string;
}

export interface PromotionResponse {
  success: boolean;
  message: string;
  promotion_id?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PromotionStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | null;
  reason: string;
  additional_info?: string;
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
}

export class PromotionService {
  /**
   * Verifica si el usuario es elegible para solicitar promoción
   */
  async checkEligibility(): Promise<{ data: PromotionEligibility }> {
    return apiClient.get<{ data: PromotionEligibility }>('/promotion/eligibility');
  }

  /**
   * Verifica si el DNI existe en el sistema del club
   * Nota: Puede fallar por conectividad externa (manejable)
   */
  async checkDNI(dni: string): Promise<{ data: DNICheckResponse }> {
    const request: DNICheckRequest = { dni };
    return apiClient.post<{ data: DNICheckResponse }>('/promotion/check-dni', request);
  }

  /**
   * Envía solicitud de promoción a usuario API
   * Requiere verificación previa de DNI
   */
  async requestPromotion(promotionData: PromotionRequest): Promise<{ data: PromotionResponse }> {
    return apiClient.post<{ data: PromotionResponse }>('/promotion/request', promotionData);
  }

  /**
   * Obtiene el estado actual de la solicitud de promoción del usuario
   */
  async getPromotionStatus(): Promise<{ data: PromotionStatus | null }> {
    return apiClient.get<{ data: PromotionStatus | null }>('/promotion/status');
  }

  /**
   * Cancela una solicitud de promoción pendiente
   */
  async cancelPromotion(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>('/promotion/cancel');
  }

  // Helper methods

  /**
   * Verifica si el usuario puede solicitar promoción
   */
  async canRequestPromotion(): Promise<boolean> {
    try {
      const response = await this.checkEligibility();
      return response.data.eligible && response.data.can_request;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica si el DNI es válido en el sistema del club con manejo de errores
   */
  async isDNIValidInClub(dni: string): Promise<{ valid: boolean; message: string }> {
    try {
      const response = await this.checkDNI(dni);
      return {
        valid: response.data.exists && response.data.valid,
        message: response.data.message,
      };
    } catch (error) {
      // Manejo de errores de conectividad externa
      return {
        valid: false,
        message: 'Error de conectividad con el sistema del club. Intenta más tarde.',
      };
    }
  }

  /**
   * Flujo completo de solicitud de promoción
   */
  async submitPromotionRequest(
    dni: string,
    reason: string,
    clubPassword: string,
    additionalInfo?: string
  ): Promise<{
    success: boolean;
    message: string;
    promotionId?: string;
  }> {
    try {
      // 1. Verificar elegibilidad
      const eligibilityResponse = await this.checkEligibility();
      if (!eligibilityResponse.data.eligible || !eligibilityResponse.data.can_request) {
        return {
          success: false,
          message: eligibilityResponse.data.reason || 'No eres elegible para promoción',
        };
      }

      // 2. Verificar DNI en sistema del club
      const dniCheck = await this.isDNIValidInClub(dni);
      if (!dniCheck.valid) {
        return {
          success: false,
          message: dniCheck.message,
        };
      }

      // 3. Enviar solicitud de promoción
      const promotionRequest: PromotionRequest = {
        reason,
        additional_info: additionalInfo,
        club_password: clubPassword,
      };

      const response = await this.requestPromotion(promotionRequest);

      return {
        success: response.data.success,
        message: response.data.message,
        promotionId: response.data.promotion_id,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al procesar la solicitud de promoción',
      };
    }
  }
}

export const promotionService = new PromotionService();
