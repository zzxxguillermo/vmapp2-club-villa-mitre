import { apiClient } from '../../../services/api';
import {
  Usuario,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SocialLoginRequest,
} from '../../../types';
import { mapBackendUserToFrontend } from '../../../utils/userMapper';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    // Save token to AsyncStorage for persistence
    if (response.data?.token) {
      await apiClient.setAuthToken(response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData);

    // Save token to AsyncStorage for persistence
    if (response.data?.token) {
      await apiClient.setAuthToken(response.data.token);
    }

    return response;
  }

  async socialLogin(socialData: SocialLoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/social-login', socialData);

    // Save token to AsyncStorage for persistence
    if (response.data?.token) {
      await apiClient.setAuthToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/logout');

      // Remove token from AsyncStorage
      await apiClient.removeAuthToken();

      return response;
    } catch (error) {
      // Even if the API call fails, remove the token locally
      await apiClient.removeAuthToken();
      throw error;
    }
  }

  async getCurrentUser(): Promise<{ data: Usuario }> {
    return apiClient.get<{ data: Usuario }>('/auth/me');
  }

  // Helper method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    return await apiClient.hasAuthToken();
  }

  // Helper method to get user data with proper mapping
  async getUserData(): Promise<Usuario | null> {
    try {
      const response = await this.getCurrentUser();
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
