import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  loginUser, 
  registerUser, 
  socialLogin, 
  logoutUser, 
  getCurrentUser, 
  clearError, 
  clearSession 
} from '../store/slices/authSlice';
import { LoginRequest, RegisterRequest, SocialLoginRequest } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  // Debug para verificar el usuario actual
  if (__DEV__ && user) {
    console.log('🔐 useAuth - Usuario actual:', {
      id: user.id,
      name: user.name,
      user_type: user.user_type,
      type_label: user.type_label
    });
  }

  const login = useCallback(
    (credentials: LoginRequest) => {
      return dispatch(loginUser(credentials));
    },
    [dispatch]
  );

  const register = useCallback(
    (userData: RegisterRequest) => {
      return dispatch(registerUser(userData));
    },
    [dispatch]
  );

  const loginWithSocial = useCallback(
    (socialData: SocialLoginRequest) => {
      return dispatch(socialLogin(socialData));
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(clearSession());
    } catch (error) {
      // Si falla el logout del servidor, limpiar sesión local de todas formas
      dispatch(clearSession());
      throw error;
    }
  }, [dispatch]);

  const checkAuth = useCallback(() => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  // const promote = useCallback(
  //   (userId: number) => {
  //     return dispatch(promoteUser(userId));
  //   },
  //   [dispatch]
  // );

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

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
