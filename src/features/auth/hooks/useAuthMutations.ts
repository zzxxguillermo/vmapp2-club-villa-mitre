import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '../../../types';
import { useAppDispatch } from '../../../hooks/redux';
import { setUser, clearSession } from '../store/authSlice';
import { apiClient } from '../../../services/api';

export const useAuthMutations = () => {
    const dispatch = useAppDispatch();

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),
        onSuccess: (data: LoginResponse) => {
            if (data.data?.user) {
                dispatch(setUser(data.data.user));
            }
            if (data.data?.token) {
                apiClient.setAuthToken(data.data.token);
            }
        },
    });

    const registerMutation = useMutation({
        mutationFn: (userData: RegisterRequest) => authService.register(userData),
        onSuccess: (data: RegisterResponse) => {
            if (data.data?.user) {
                dispatch(setUser(data.data.user));
            }
            if (data.data?.token) {
                apiClient.setAuthToken(data.data.token);
            }
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            dispatch(clearSession());
            apiClient.removeAuthToken();
        },
        onError: () => {
            // Even if API fails, we clear local session
            dispatch(clearSession());
            apiClient.removeAuthToken();
        },
    });

    return {
        login: loginMutation,
        register: registerMutation,
        logout: logoutMutation,
    };
};
