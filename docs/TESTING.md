# Guía de Testing

Este proyecto utiliza **Jest** como framework de testing y **React Native Testing Library** para pruebas de componentes.

## 🏃‍♂️ Ejecutar Tests

```bash
# Correr todos los tests
npm test

# Correr tests en modo watch (re-run al guardar)
npm run test:watch

# Correr tests con reporte de cobertura
npm test -- --coverage
```

## 🧪 Estructura de Tests

Los tests se encuentran coubicados con el código fuente o en carpetas `__tests__` dentro de cada feature.

*   **Unit Tests:** Prueban lógica de negocio pura (utils, hooks).
*   **Component Tests:** Prueban renderizado e interacción de usuario.
*   **Integration Tests:** Prueban flujos completos (ej: Login).

## 🎭 Mocks y Setup

La configuración global de tests está en `jest.config.js` y el archivo de setup en `src/__tests__/setup.ts`.

### Mocks Globales (`src/__tests__/setup.ts`)
Para evitar errores con librerías nativas, tenemos mocks pre-configurados para:
*   `expo-modules-core`
*   `expo-constants`
*   `expo-image`
*   `@react-native-async-storage/async-storage`
*   `react-native-reanimated`

### Mocks Específicos
Si necesitas mockear una librería solo para un test, usa `jest.mock()` dentro del archivo de test.

```typescript
// Ejemplo de mock local
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { name: 'Test User' }
  }),
}));
```

## 📝 Escribiendo Tests

### Ejemplo: Test de Componente

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent title="Hola" />);
    expect(getByText('Hola')).toBeTruthy();
  });

  it('handles press', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<MyComponent onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## 🚫 Solución de Problemas Comunes

*   **"Jest has detected the following 1 open handle potentially keeping Jest from exiting":** Usualmente causado por promesas no resueltas o timers. Asegúrate de limpiar efectos o usar `jest.useFakeTimers()`.
*   **"Invariant Violation: Native module cannot be null":** Falta un mock para una librería nativa. Agrégalo a `src/__tests__/setup.ts`.
