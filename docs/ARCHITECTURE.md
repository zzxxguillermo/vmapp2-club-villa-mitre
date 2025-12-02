# Arquitectura del Proyecto

## 🏗️ Estructura de Carpetas (Feature-First)

El proyecto sigue una arquitectura **Feature-First**, donde el código se organiza principalmente por funcionalidad de negocio en lugar de por tipo de archivo.

```
src/
├── features/           # Módulos de negocio (Auth, Beneficios, Gym, etc.)
│   ├── auth/
│   │   ├── components/ # Componentes exclusivos de Auth
│   │   ├── hooks/      # Hooks exclusivos de Auth (useAuth)
│   │   ├── screens/    # Pantallas de Auth (Login, Register)
│   │   ├── services/   # Llamadas API de Auth
│   │   ├── store/      # Slice de Redux o estado local
│   │   └── types/      # Tipos TypeScript de Auth
│   └── beneficios/     # Otro feature...
├── components/         # Componentes UI reutilizables (UI Kit)
├── hooks/              # Hooks globales (useDebounce, useAppDispatch)
├── navigation/         # Configuración de rutas y navegadores
├── services/           # Configuración base de API (Axios instance)
├── store/              # Configuración del Store de Redux
├── styles/             # Tema global y constantes de estilo
└── utils/              # Funciones de utilidad puras
```

## 🧠 Gestión de Estado

Utilizamos una estrategia híbrida para el manejo de estado:

1.  **Server State (TanStack Query):**
    *   Para todo lo que viene de la API (Beneficios, Gym, etc.).
    *   Maneja caching, reintentos, y estados de carga (`isLoading`, `isError`).
    *   *Ejemplo:* `useBeneficios` usa `useInfiniteQuery`.

2.  **Client State (Redux Toolkit):**
    *   Para estado global de la aplicación que no persiste en el servidor.
    *   Principalmente para **Autenticación** (token, user info) y preferencias de UI.
    *   *Ejemplo:* `authSlice` maneja el token JWT.

3.  **Local State (React.useState/useReducer):**
    *   Para estado efímero de componentes (formularios, toggles, inputs).

## 🎨 Sistema de Diseño (UI Kit)

Los componentes base se encuentran en `src/components/` y deben ser usados preferentemente sobre los componentes nativos de React Native para asegurar consistencia.

*   **Tipografía:** Usar componente `Typography` o estilos de texto definidos en `src/styles/theme.ts`.
*   **Colores:** Importar desde `src/constants/colors.ts`.
*   **Espaciado:** Usar constantes de `src/constants/layout.ts`.

## 🚀 Patrones Clave

*   **Servicios Centralizados:** Todas las llamadas a API están encapsuladas en archivos `*Service.ts`. Los componentes nunca hacen `fetch` directamente.
*   **Custom Hooks:** La lógica de negocio y efectos se extraen a hooks (ej: `useQRGenerator`) para mantener las pantallas ("View") limpias.
*   **Adaptadores:** Transformamos los datos de la API a interfaces de dominio en el frontend para desacoplarnos del backend (ej: `mapApiToBeneficio`).
