import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, shouldUseMirageServer } from '../utils/environment';

// Base API configuration
const API_BASE_URL = shouldUseMirageServer() ? '/api' : getApiBaseUrl();

export interface ApiError extends Error {
  validationErrors?: Record<string, string[]> | null;
  statusCode?: number;
  originalError?: AxiosError;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (__DEV__) {
          console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('💥 Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError<any>) => {
        const formattedError = this.handleError(error);
        return Promise.reject(formattedError);
      }
    );
  }

  private handleError(error: AxiosError<any>): ApiError {
    let errorMessage = 'An unexpected error occurred';
    let validationErrors = null;
    let statusCode = 0;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      statusCode = error.response.status;
      console.error(`❌ API Error: ${statusCode} ${error.response.statusText}`);

      const errorData = error.response.data;

      if (errorData) {
        if (errorData.message) {
          errorMessage = errorData.message;
        }

        if (errorData.errors) {
          validationErrors = errorData.errors;
          // Laravel validation errors flattening
          const errors = Object.values(errorData.errors).flat();
          if (errors.length > 0) {
            errorMessage = String(errors.join('\n'));
          }
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'Network Error: No response received';
      console.error('🌐 Network connectivity issue detected');
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    }

    const customError: ApiError = new Error(errorMessage);
    customError.validationErrors = validationErrors;
    customError.statusCode = statusCode;
    customError.originalError = error;

    return customError;
  }

  // Token management methods
  async getAuthToken(): Promise<string | null> {
    try {
      if (shouldUseMirageServer()) {
        return null;
      }
      const token = await AsyncStorage.getItem('auth_token');
      return token;
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting auth token from AsyncStorage:', error);
      }
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
      if (__DEV__) {
        console.log('🔐 Token saved to AsyncStorage');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving auth token to AsyncStorage:', error);
      }
      throw error;
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      if (__DEV__) {
        console.log('🔐 Token removed from AsyncStorage');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error removing auth token from AsyncStorage:', error);
      }
      throw error;
    }
  }

  async hasAuthToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token !== null;
    } catch (error) {
      if (__DEV__) {
        console.error('Error checking auth token:', error);
      }
      return false;
    }
  }

  // Generic request methods
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data;
  }

  async post<T, D = unknown>(endpoint: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T, D = unknown>(endpoint: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
