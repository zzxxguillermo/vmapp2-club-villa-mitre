import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  getCurrentUser,
  clearError,
} from '../store/authSlice';
import { LoginRequest, RegisterRequest, SocialLoginRequest } from '../../../types';
import { useAuthMutations } from './useAuthMutations';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { login: loginMutation, register: registerMutation, logout: logoutMutation } = useAuthMutations();

  // Combined loading state
  const loading = loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;

  // Combined error state (prioritize login/register errors)
  const error = loginMutation.error?.message || registerMutation.error?.message || logoutMutation.error?.message || null;

  // Debug para verificar el usuario actual
  if (__DEV__ && user) {
    console.log('🔐 useAuth - Usuario actual:', {
      id: user.id,
      name: user.name,
      user_type: user.user_type,
      type_label: user.type_label,
    });
  }

  const login = useCallback(
    async (credentials: LoginRequest) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (userData: RegisterRequest) => {
      return registerMutation.mutateAsync(userData);
    },
    [registerMutation]
  );

  const loginWithSocial = useCallback(
    async (socialData: SocialLoginRequest) => {
      // TODO: Implement social login mutation if needed
      console.warn('Social login not yet migrated to mutations');
      // return dispatch(socialLogin(socialData));
    },
    []
  );

  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const checkAuth = useCallback(() => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
    loginMutation.reset();
    registerMutation.reset();
    logoutMutation.reset();
  }, [dispatch, loginMutation, registerMutation, logoutMutation]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    loginWithSocial,
    logout,
    checkAuth,
    clearAuthError,
  };
};
