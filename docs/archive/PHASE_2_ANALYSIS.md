# 💾 Fase 2: Análisis de Capa de Datos y Lógica de Negocio

**Fecha:** 01/12/2025
**Auditor:** Antigravity (Senior AI Architect)
**Estado:** Completado

---

## 1. Auditoría de Servicios API (`api.ts`)

### Estado Actual

- Clase `ApiClient` singleton.
- Manejo de tokens con `AsyncStorage`.
- Lógica de logging excesiva en `request`.
- Manejo de errores verboso y acoplado a estructuras específicas de Laravel (`errorData.errors`).

### 🚩 Hallazgos

- **Logging en Producción:** El método `request` tiene bloques `console.log` detallados que, aunque útiles en dev, ensucian la consola.
- **Acoplamiento:** El cliente API "sabe" demasiado sobre la estructura de errores del backend. Si el backend cambia, el cliente se rompe.
- **Token Management:** La lógica de obtener/guardar token está mezclada con la lógica de hacer peticiones.

### ✅ Recomendación

- **Interceptor Pattern:** Mover el logging y la inyección de tokens a interceptores (o wrappers alrededor de `fetch`).
- **Error Normalization:** Crear una clase `ApiError` estandarizada que transforme cualquier error del backend en un formato único para la UI.

---

## 2. Estandarización de Modelos de Datos (`src/types`)

### Estado Actual (`src/types/gym.ts`)

- Interfaces bien definidas para el dominio del gimnasio (`Assignment`, `DailyTemplate`).
- Tipos de respuesta de API (`AssignmentsResponse`).

### 🚩 Hallazgos

- **Inconsistencia:** Otros módulos (como `Actividades`) no parecen tener tipos tan estrictos o centralizados como `gym.ts`.
- **DTOs vs Domain:** No hay distinción clara entre lo que viene de la API (DTO) y lo que usa la app (Domain Model). Actualmente se usan los mismos tipos, lo que hace que el frontend sea frágil ante cambios de backend.

### ✅ Recomendación

- **Zod Schemas:** Implementar validación en tiempo de ejecución con Zod para asegurar que la API devuelve lo que esperamos.
- **Mappers:** Crear funciones puras que transformen `BackendResponse -> AppModel`.

---

## 3. Desacoplamiento de Lógica de Negocio (Hooks)

### Estado Actual

- `useGymAssignments.ts`: Buen ejemplo de encapsulamiento. Maneja carga, estado y refresco.
- `useActividades.ts`: Usa Redux (`useAppDispatch`, `useAppSelector`).

### 🚩 Hallazgos

- **Redux Boilerplate:** `useActividades` es básicamente un wrapper alrededor de Redux. Tiene lógica de logging manual (`console.log('🎣 useActividadesUsuario...')`) que es ruido.
- **Race Conditions:** `useGymAssignments` maneja la carga paralela con `Promise.all`, lo cual es bueno, pero la lógica de `refreshData` con `setInterval` podría causar condiciones de carrera si una petición tarda más de 60s.

### ✅ Recomendación

- **React Query Migration:** Como se mencionó en la Fase 1, migrar estos hooks a `useQuery` eliminaría el 90% del código manual de manejo de estado de carga, errores y reintentos.

---

## 4. Estrategia de Caché y Persistencia

### Estado Actual

- `AsyncStorage` para tokens y persistencia de Redux (`auth`).
- Caché manual en memoria (variables de estado).

### 🚩 Hallazgos

- **Caché Frágil:** Si el usuario cierra la app, los datos del gimnasio se pierden y deben recargarse.
- **Persistencia Limitada:** Solo `auth` se persiste. Si el usuario está offline, no puede ver su rutina.

### ✅ Recomendación

- **Offline-First:** Usar `TanStack Query` con persistencia (`createAsyncStoragePersister`) permitiría que el usuario vea su última rutina cargada incluso sin internet.

---

## 📝 Plan de Acción Inmediato (Siguientes Pasos)

1.  **Limpieza de `api.ts`:** Refactorizar para usar una estructura más limpia y menos verbosa.
2.  **Migración a React Query:** Crear un POC migrando `useGymAssignments` a React Query.
3.  **Tipado de Actividades:** Crear `src/types/actividades.ts` si no existe o completarlo.
