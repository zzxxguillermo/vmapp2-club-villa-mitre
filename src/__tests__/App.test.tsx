import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mock navigation
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }),
}));

// Mock providers and hooks
jest.mock('../providers/AppProvider', () => ({
    AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../features/auth/hooks/useAuth', () => ({
    useAuth: () => ({
        isAuthenticated: false,
    }),
}));

describe('App Smoke Test', () => {
    it('renders correctly without crashing', () => {
        render(<App />);
        // If it renders without throwing, the smoke test passes
        expect(true).toBeTruthy();
    });
});
