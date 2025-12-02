import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Utility functions for environment configuration
 */

/**
 * Check if Mirage server should be used based on environment configuration
 * Priority: app.json extra config > .env file > development mode
 */
export const shouldUseMirageServer = (): boolean => {
  // First check app.json extra configuration
  const extraConfig = Constants.expoConfig?.extra?.USE_MIRAGE_SERVER;
  if (extraConfig !== undefined) {
    return extraConfig === true || extraConfig === 'true';
  }

  // Fallback to environment variable
  const envVar = process.env.USE_MIRAGE_SERVER;
  if (envVar !== undefined) {
    return envVar === 'true';
  }

  // Default to development mode
  return __DEV__;
};

/**
 * Get the API base URL from environment configuration
 * Handles platform-specific URLs for development and production
 */
export const getApiBaseUrl = (): string => {
  // First check app.json extra configuration
  const extraConfig = Constants.expoConfig?.extra?.API_BASE_URL;
  if (extraConfig) {
    return extraConfig;
  }

  // Fallback to environment variable
  const envVar = process.env.API_BASE_URL;
  if (envVar) {
    return envVar;
  }

  // Platform-specific defaults for local development
  if (__DEV__) {
    // Production API server
    return 'https://appvillamitre.surtekbb.com/api';
  }

  // Production fallback
  return 'https://appvillamitre.surtekbb.com/api';
};

/**
 * Log current environment configuration
 */
export const logEnvironmentConfig = (): void => {
  console.log('🔧 Environment Configuration:');
  console.log('  - USE_MIRAGE_SERVER:', shouldUseMirageServer());
  console.log('  - API_BASE_URL:', getApiBaseUrl());
  console.log('  - Platform:', Platform.OS);
  console.log('  - __DEV__:', __DEV__);
  console.log('  - Extra config:', Constants.expoConfig?.extra);
};

/**
 * Test network connectivity to the API server
 */
export const testApiConnectivity = async (): Promise<void> => {
  const apiUrl = getApiBaseUrl();
  console.log('🔍 Testing API connectivity...');
  console.log('🎯 Target URL:', apiUrl);

  try {
    // Test basic connectivity to domain
    const baseUrl = apiUrl.replace('/api', '');
    console.log('🌐 Testing base domain:', baseUrl);

    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'VillaMitreApp/1.0.0',
      },
    });

    console.log('✅ Base domain test:', response.status, response.statusText);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    // Test API endpoint specifically
    console.log('🔍 Testing API endpoint:', `${apiUrl}/auth/login`);
    const apiResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'VillaMitreApp/1.0.0',
      },
      body: JSON.stringify({
        dni: 'test',
        password: 'test',
      }),
    });

    console.log('🔍 API login endpoint test:', apiResponse.status, apiResponse.statusText);

    if (apiResponse.status === 422 || apiResponse.status === 401) {
      console.log('✅ API endpoint is responding (validation/auth error expected)');
    }
  } catch (error) {
    console.error('❌ Connectivity test failed:', error);

    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error('🚨 NETWORK ISSUE DETECTED:');
      console.error('  1. Check if localtunnel server is running at:', apiUrl);
      console.error('  2. Verify DNS resolution for: villamitre.loca.lt');
      console.error('  3. Check if localtunnel tunnel is active');
      console.error('  4. Verify device network connection');
      console.error('  5. Try accessing', apiUrl, 'in browser');
    }

    // Additional error details
    if (error && typeof error === 'object') {
      console.error('🔍 Error object:', {
        name: (error as any).name,
        message: (error as any).message,
        code: (error as any).code,
        stack: (error as any).stack,
      });
    }
  }
};

/**
 * Get debug flags for troubleshooting
 */
export const getDebugFlags = () => {
  return {
    useMirage: shouldUseMirageServer(),
    apiBaseUrl: getApiBaseUrl(),
    platform: Platform.OS,
    isDev: __DEV__,
    extraConfig: Constants.expoConfig?.extra,
  };
};
