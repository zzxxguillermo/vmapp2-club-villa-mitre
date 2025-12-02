# 🕵️ Plan Maestro de Análisis y Refactorización (20 Pasos)

Este documento define una metodología exhaustiva de 20 pasos para auditar, analizar y preparar el proyecto `VMApp2` para una refactorización de clase mundial, alineada con las mejores prácticas de la industria (Clean Architecture, SOLID, DRY).

---

## 🏗️ Fase 1: Arquitectura y Estructura Global (Pasos 1-5)

### 1. Auditoría de Estructura de Directorios

- **Objetivo:** Evaluar si la estructura actual (`src/screens`, `src/components`, etc.) soporta la escalabilidad.
- **Acción:** Analizar si conviene migrar a una estructura por "features" (ej: `src/features/gym`, `src/features/auth`) en lugar de por tipo de archivo.
- **Entregable:** Propuesta de nueva estructura de carpetas.

### 2. Análisis de Dependencias y `package.json`

- **Objetivo:** Detectar librerías obsoletas, redundantes o incompatibles.
- **Acción:** Revisar versiones de Expo, React Native y librerías de terceros. Identificar vulnerabilidades (`npm audit`).
- **Entregable:** Reporte de actualización de dependencias.

### 3. Evaluación de Flujo de Navegación

- **Objetivo:** Entender cómo se mueve el usuario por la app.
- **Acción:** Mapear todas las rutas y stacks de navegación. Buscar navegación circular o props drilling excesivo en parámetros de ruta.
- **Entregable:** Diagrama de flujo de navegación actual vs. ideal.

### 4. Revisión de Gestión de Estado Global (Redux)

- **Objetivo:** Determinar si Redux se usa correctamente o si hay abuso.
- **Acción:** Auditar `src/store`. Identificar qué datos _realmente_ necesitan ser globales y cuáles deberían ser estado local o de servidor (React Query).
- **Entregable:** Plan de migración de estado (ej: Redux -> TanStack Query para datos de servidor).

### 5. Análisis de Configuración y Variables de Entorno

- **Objetivo:** Verificar seguridad y flexibilidad.
- **Acción:** Revisar cómo se manejan las URLs de API, claves secretas y configuraciones por entorno (Dev/Prod).
- **Entregable:** Estrategia de `env` vars segura.

---

## 💾 Fase 2: Capa de Datos y Lógica de Negocio (Pasos 6-10)

### 6. Auditoría de Servicios API (`api.ts`)

- **Objetivo:** Estandarizar la comunicación con el backend.
- **Acción:** Revisar interceptores, manejo de tokens y transformación de errores. Eliminar lógica de UI dentro de la capa de red.
- **Entregable:** Diseño de un cliente HTTP agnóstico y robusto.

### 7. Estandarización de Modelos de Datos (TypeScript)

- **Objetivo:** Eliminar `any` y asegurar tipos estrictos.
- **Acción:** Crear interfaces para TODAS las respuestas del backend (DTOs) y modelos de dominio internos.
- **Entregable:** Archivo `src/types/domain.ts` completo.

### 8. Desacoplamiento de Lógica de Negocio (Service Layer)

- **Objetivo:** Sacar la lógica de los componentes React.
- **Acción:** Identificar lógica compleja en screens y moverla a Custom Hooks o Servicios puros.
- **Entregable:** Lista de hooks a crear (ej: `useAuthLogic`, `useWorkoutManager`).

### 9. Estrategia de Caché y Persistencia

- **Objetivo:** Mejorar la experiencia offline y performance.
- **Acción:** Evaluar el uso de `AsyncStorage` y `redux-persist`. Definir políticas de invalidación de caché.
- **Entregable:** Política de persistencia de datos.

### 10. Manejo de Errores Global

- **Objetivo:** Evitar crashes silenciosos o pantallas blancas.
- **Acción:** Diseñar un sistema de Error Boundaries y un servicio de logging centralizado.
- **Entregable:** Implementación de `ErrorBoundary` global.

---

## 🎨 Fase 3: UI/UX y Componentes (Pasos 11-15)

### 11. Auditoría de "God Components"

- **Objetivo:** Detectar componentes gigantes (como el antiguo `GimnasioScreen`).
- **Acción:** Listar archivos de >300 líneas y planear su fragmentación.
- **Entregable:** Lista de componentes a refactorizar.

### 12. Sistema de Diseño y UI Kit

- **Objetivo:** Consistencia visual.
- **Acción:** Centralizar colores, tipografías y espaciados en un `theme`. Crear componentes base (`Button`, `Card`, `Input`) reutilizables.
- **Entregable:** Guía de estilos y componentes atómicos.

### 13. Análisis de Performance de Renderizado

- **Objetivo:** UI fluida a 60fps.
- **Acción:** Identificar re-renders innecesarios usando React DevTools. Evaluar uso de `useMemo` y `useCallback`.
- **Entregable:** Reporte de cuellos de botella de rendimiento.

### 14. Accesibilidad (a11y)

- **Objetivo:** App usable para todos.
- **Acción:** Verificar etiquetas, tamaños de toque mínimos y contraste de colores.
- **Entregable:** Checklist de correcciones de accesibilidad.

### 15. Internacionalización (i18n)

- **Objetivo:** Preparar la app para múltiples idiomas.
- **Acción:** Identificar todos los strings "quemados" en el código y planear su extracción a archivos de traducción.
- **Entregable:** Configuración inicial de i18n.

---

## 🛡️ Fase 4: Calidad, Testing y DevOps (Pasos 16-20)

### 16. Estrategia de Testing Unitario

- **Objetivo:** Asegurar que la lógica no se rompa.
- **Acción:** Definir qué testear (prioridad: utilidades y hooks). Configurar Jest + React Native Testing Library.
- **Entregable:** Configuración de entorno de pruebas.

### 17. Tests de Integración y E2E

- **Objetivo:** Verificar flujos críticos.
- **Acción:** Planear tests para flujos clave (Login, Ver Rutina) usando Maestro o Detox.
- **Entregable:** Guiones de prueba E2E.

### 18. Análisis Estático de Código (Linting & Formatting)

- **Objetivo:** Código limpio y uniforme.
- **Acción:** Configurar ESLint, Prettier y Husky para pre-commit hooks. Forzar reglas estrictas de TypeScript.
- **Entregable:** Configuración `.eslintrc` y `.prettierrc` estricta.

### 19. Seguridad en el Frontend

- **Objetivo:** Proteger datos del usuario.
- **Acción:** Revisar almacenamiento de tokens, sanitización de inputs y ofuscación de código en producción.
- **Entregable:** Reporte de auditoría de seguridad.

### 20. Documentación y Onboarding

- **Objetivo:** Que cualquier dev pueda sumarse rápido.
- **Acción:** Crear `README.md` técnico, documentar arquitectura y flujos principales.
- **Entregable:** Carpeta `docs/` con documentación técnica actualizada.
