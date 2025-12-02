# 🏗️ Fase 1: Análisis de Arquitectura y Estructura Global

**Fecha:** 01/12/2025
**Auditor:** Antigravity (Senior AI Architect)
**Estado:** Completado

---

## 1. Auditoría de Estructura de Directorios

### Estado Actual

La estructura sigue un patrón de **"Layered Architecture"** (organización por tipo de archivo):

```
src/
  ├── components/   # Componentes compartidos
  ├── screens/      # Vistas completas
  ├── services/     # Lógica de API
  ├── store/        # Estado global (Redux)
  ├── hooks/        # Custom hooks
  └── ...
```

### 🚩 Hallazgos

- **Escalabilidad Limitada:** A medida que la app crece, la carpeta `screens` y `components` se vuelven inmanejables. Encontrar todos los archivos relacionados con una funcionalidad (ej: "Gimnasio") requiere saltar entre 5 carpetas diferentes.
- **Baja Cohesión:** Archivos que cambian juntos no están ubicados juntos.

### ✅ Recomendación: "Feature-First Architecture"

Migrar gradualmente a una estructura basada en funcionalidades (Features).

```
src/
  ├── features/
  │   ├── auth/
  │   │   ├── components/
  │   │   ├── screens/
  │   │   ├── services/
  │   │   └── hooks/
  │   ├── gym/
  │   │   ├── components/
  │   │   ├── screens/
  │   │   └── ...
  ├── shared/       # Lo que es realmente genérico (UI Kit, Utils)
  └── ...
```

---

## 2. Análisis de Dependencias (`package.json`)

### Estado Actual

- **Core:** React Native 0.79.5, Expo ~53.0. (Muy actualizado, excelente).
- **Navegación:** React Navigation v7 (Última versión).
- **Estado:** Redux Toolkit + Redux Persist.
- **Utilidades:** Lodash, MirageJS.

### 🚩 Hallazgos

- **Lodash:** Importar la librería completa (`import _ from 'lodash'`) aumenta innecesariamente el tamaño del bundle. Se debe usar imports específicos (`import map from 'lodash/map'`) o reemplazar con funciones nativas de ES6+.
- **MirageJS:** Excelente para desarrollo, pero asegurar que se elimine completamente del bundle de producción (tree-shaking).

---

## 3. Evaluación de Flujo de Navegación

### Estado Actual (`App.tsx`)

- **Stack Simple:** `Onboarding` -> `Login` -> `Home`.
- **Lógica de Ruteo:** Basada en `isAuthenticated` del hook `useAuth`.

### 🚩 Hallazgos

- **Estructura Plana:** Todas las pantallas parecen estar en el mismo nivel en `src/screens`.
- **Falta de Deep Linking:** No se observa configuración para abrir la app desde URLs externas (ej: abrir directamente en una rutina).

### ✅ Recomendación

- Implementar **Nested Navigators**. `Home` debería tener su propio stack o tabs.
- Configurar el prop `linking` en `NavigationContainer` para soportar deep links.

---

## 4. Revisión de Gestión de Estado (Redux)

### Estado Actual (`src/store/index.ts`)

- **Slices:** `auth`, `actividades`, `beneficios`, `cupones`, `puntos`, `locales`, `estadoCuenta`.
- **Persistencia:** Solo `auth` se persiste en disco.

### 🚩 Hallazgos Críticos

- **Abuso de Redux para Server State:** Se está usando Redux para almacenar datos que vienen del servidor (`actividades`, `beneficios`). Esto obliga a escribir thunks, manejar estados de `loading`/`error` manualmente y gestionar la invalidación de caché "a mano".
- **Boilerplate:** Redux Toolkit reduce el código, pero sigue siendo verboso para simplemente "traer y mostrar datos".

### ✅ Recomendación: Migración a TanStack Query

- **Server State:** Mover `actividades`, `beneficios`, `cupones`, etc. a **TanStack Query (React Query)**.
- **Client State:** Mantener en Redux solo lo que es verdaderamente global y del cliente (ej: `auth` token, preferencias de tema, carrito de compras si hubiera).
- **Beneficio:** Eliminación masiva de código (reducers, thunks), caché automático, reintentos automáticos y mejor UX.

---

## 5. Configuración y Variables de Entorno

### Estado Actual

- Uso de `.env` para `API_BASE_URL`.
- Switch para `USE_MIRAGE_SERVER`.

### ✅ Recomendación

- Implementar validación de variables de entorno (ej: usando `t3-env` o similar) para asegurar que la app no compile si faltan claves críticas.

---

## 📝 Plan de Acción Inmediato (Siguientes Pasos)

1.  **Refactorización de Directorios:** Crear `src/features/gym` y mover los componentes recién creados allí.
2.  **Optimización de Imports:** Revisar uso de Lodash.
3.  **POC de React Query:** Implementar una pequeña funcionalidad (ej: `Beneficios`) usando React Query para demostrar la reducción de código.
