import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

// Mock useAuth
const mockLogin = jest.fn();
jest.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        login: mockLogin,
        loading: false,
        error: null,
    }),
}));

describe('LoginScreen', () => {
    const mockProps: any = {
        navigation: {
            navigate: mockNavigate,
            replace: jest.fn(),
        },
        route: {},
    };

    it('renders correctly', () => {
        const { getByPlaceholderText, getByText } = render(<LoginScreen {...mockProps} />);

        expect(getByPlaceholderText('Ingresá tu DNI')).toBeTruthy();
        expect(getByPlaceholderText('Ingresá tu contraseña')).toBeTruthy();
        expect(getByText('INGRESAR')).toBeTruthy();
    });

    it('navigates to Register on link press', () => {
        const { getByText } = render(<LoginScreen {...mockProps} />);

        fireEvent.press(getByText('Registrarme'));
        expect(mockProps.navigation.navigate).toHaveBeenCalledWith('Register');
    });
});
