# 📋 Estado de Refactorización y Deuda Técnica

Este documento rastrea el progreso de la refactorización y, lo más importante, registra los problemas conocidos y la deuda técnica que decidimos posponer para no bloquear el avance.

---

## ✅ Completado

### Fase 1: Cimientos y Calidad
- **Linting & Formatting:**
  - Se instaló `eslint` (v8), `prettier`, `eslint-config-expo`.
  - Se configuraron `.eslintrc.js` y `.prettierrc`.
  - Se ejecutó `npm run lint:fix` y `npm run format` en todo el proyecto.
  - **Resultado:** Código estandarizado y limpio de errores de estilo básicos.

- **Infraestructura de Testing (Parcial):**
  - Se instaló `jest`, `jest-expo`, `@testing-library/react-native`.
  - Se configuró `jest.config.js` y `src/test/setup.ts`.
  - Se añadieron scripts `test` y `validate` al `package.json`.

### Fase 2: Modernización Estructural
- **Arquitectura Feature-First:**
  - Se creó `src/features/auth` y se migraron screens, hooks, services y store.
  - Se corrigieron todas las importaciones en el proyecto.
- **Cliente API (Axios):**
  - Se reemplazó el wrapper de `fetch` por `axios`.
  - Se implementaron interceptores para Token (Request) y Manejo de Errores (Response).
- **TanStack Query:**
  - Se instaló `@tanstack/react-query`.
  - Se configuró `QueryClientProvider` en `AppProvider`.
- **Validación (Zod):**
  - Se creó `src/schemas/authSchemas.ts` con validaciones para Login y Registro.

---

## ⚠️ Pendientes / Deuda Técnica (Para revisar al final)

### 1. Tests "Colgados" (High Priority)
- **Problema:** Al ejecutar `npm test`, Jest se queda colgado (hangs) después de ejecutar los tests, o falla por timeouts en entornos de CI.
- **Causa Probable:** Conflictos con mocks nativos, específicamente `react-native-reanimated` o `react-native-gesture-handler` en la versión actual de Expo/React Native.
- **Acción Futura:** Investigar configuración de `jest-expo` para la versión específica de RN 0.79+. Simplificar mocks o usar `jest --forceExit` temporalmente si es necesario (no recomendado para prod).

### 2. Mocks de Navegación
- **Problema:** El smoke test de `App.tsx` requiere mockear toda la estructura de navegación y providers.
- **Acción Futura:** Crear un `renderWithProviders` utility que envuelva los componentes en los providers necesarios (Auth, Navigation, Theme) automáticamente para facilitar los tests.

---

## 📝 Notas de Ejecución
- **Decisión (01/12/2025):** Se decidió avanzar a la Fase 2 (Arquitectura) a pesar de los problemas de testing para priorizar la limpieza estructural y de lógica de negocio, que es el objetivo principal.
