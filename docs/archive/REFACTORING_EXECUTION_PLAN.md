# 🚀 Plan Maestro de Ejecución: Refactorización Integral (20 Pasos)

Este documento sintetiza los hallazgos de las 4 fases de análisis en un plan de acción concreto y secuencial. El objetivo es modernizar `VMApp2` priorizando la estabilidad, escalabilidad y calidad del código.

---

## 🏗️ Fase 1: Cimientos y Seguridad (La Base)

_Objetivo: Establecer reglas de juego claras y redes de seguridad antes de mover código crítico._

1.  **Toolchain de Calidad:** Instalar y configurar `eslint`, `prettier`, `eslint-config-universe` y `husky`.
2.  **Estandarización Automática:** Ejecutar `eslint --fix` y `prettier --write` en todo el proyecto para unificar estilos.
3.  **Infraestructura de Testing:** Configurar `jest` y `@testing-library/react-native` correctamente (crear scripts en `package.json`).
4.  **Smoke Tests:** Crear tests básicos de renderizado para `App.tsx`, `LoginScreen` y `HomeScreen` para asegurar que la app no explote al iniciar.
5.  **CI Local:** Crear script `npm run validate` (lint + tsc + test) y configurarlo como pre-push hook.

## 📐 Fase 2: Modernización Estructural

_Objetivo: Migrar a una arquitectura escalable y limpiar la capa de datos._

6.  **Feature-First Architecture:** Crear estructura `src/features/` y migrar un módulo pequeño (ej: `Auth`) para validar la estructura.
    - `src/features/auth/{components, screens, hooks, services}`
7.  **Refactorización de API:** Implementar patrón de **Interceptores** en `api.ts` para manejo centralizado de tokens y logs.
8.  **TanStack Query (Setup):** Instalar e integrar `TanStack Query` (React Query) + `AsyncStorage Persister`.
9.  **Tipado Robusto (Zod):** Definir esquemas Zod para las respuestas de API críticas (Auth, Gym) para validación en tiempo de ejecución.
10. **Navegación Anidada:** Refactorizar `App.tsx` para usar stacks anidados por feature (`AuthStack`, `HomeStack`, `GymStack`).

## 🧠 Fase 3: Refactorización del Core (Lógica)

_Objetivo: Eliminar deuda técnica en los módulos principales._

11. **Migración Auth:** Refactorizar `RegisterScreen` usando `react-hook-form` + `zod` y componentes reutilizables.
12. **Migración Gym (Data):** Reemplazar `useGymAssignments` (manual) por `useQuery` con persistencia offline.
13. **Limpieza de Redux:** Eliminar slices de Redux que ahora son manejados por React Query (ej: `actividades`, `beneficios`).
14. **Optimización de Hooks:** Desacoplar lógica de negocio de `GimnasioScreen` y moverla a hooks puros en `src/features/gym/hooks`.
15. **Estandarización de Actividades:** Aplicar el mismo patrón (React Query + Feature Folder) al módulo de Actividades.

## 🎨 Fase 4: Pulido de UI y Performance

_Objetivo: Mejorar la experiencia de usuario y desarrollador._

16. **UI Kit Estricto:** Finalizar y documentar componentes base (`Input`, `Button`, `Card`, `Typography`) y forzar su uso.
17. **Refactorización de God Components:** Dividir pantallas restantes >300 líneas (`MisBeneficiosScreen`, `QRBeneficioScreen`) en sub-componentes.
18. **Optimización de Renderizado:** Auditar re-renders con React DevTools y aplicar `memo`, `useMemo` y `useCallback` donde sea crítico.
19. **Accesibilidad (a11y):** Corregir etiquetas, áreas táctiles y contrastes según reporte de auditoría.
20. **Limpieza Final:** Eliminar código muerto, dependencias no usadas (ej: `lodash` completo) y archivos temporales.

---

## 📅 Estrategia de Ejecución Sugerida

Recomiendo proceder en orden secuencial estricto para la **Fase 1** y **Fase 2**. Una vez establecidos los cimientos y la estructura, las tareas de la Fase 3 y 4 pueden paralelizarse si hubiera más desarrolladores, o atacarse por prioridad de negocio.

**¿Por dónde empezamos? -> Paso 1: Toolchain de Calidad.**
