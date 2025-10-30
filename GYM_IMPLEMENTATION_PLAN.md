# 📋 PLAN DE IMPLEMENTACIÓN DETALLADO - SISTEMA GYM

**Fecha:** Octubre 12, 2025  
**Objetivo:** Implementar pantallas completas de visualización de rutinas

---

## ✅ SISTEMA ACTUAL (YA IMPLEMENTADO)

### **Infraestructura Existente:**

```yaml
✅ Tipos TypeScript completos (gym.ts):
   - ExerciseDetails
   - SetExercise
   - Set
   - DailyTemplate
   - Assignment
   - Todas las responses

✅ Servicio API completo (gymService.ts):
   - getMyTemplates() → /api/student/my-templates
   - getStudentAssignments(id) → /api/professor/students/{id}/assignments
   - getTemplateDetails(id) → /api/admin/gym/daily-templates/{id}
   - getWeeklySchedule(id) → /api/professor/students/{id}/weekly-schedule
   - getExercises(filters) → /api/admin/gym/exercises
   - Utilidades: formatDuration(), getWeekdaySpanish(), etc.

✅ Pantalla Principal (GimnasioScreen.tsx):
   - Muestra lista de rutinas asignadas
   - Filtra entrenamientos de hoy
   - Navegación preparada a 'TemplateDetails'
   - Loading y empty states
```

### **Navegación Preparada:**
```typescript
// En GimnasioScreen.tsx línea 65
navigation.navigate('TemplateDetails', { 
  templateId: assignment.daily_template_id,
  templateName: assignment.template_name
});
```

---

## 🎯 FASE 1: PANTALLA DE DETALLE DE RUTINA

### **1.1 Crear Estructura de Archivos**

```
src/
├── screens/
│   └── gym/
│       └── TemplateDetailScreen.tsx  ← NUEVA
│
└── components/
    └── gym/
        ├── SetCard.tsx               ← NUEVA
        ├── ExerciseDetailCard.tsx    ← NUEVA
        ├── DifficultyBadge.tsx       ← NUEVA
        ├── CategoryBadge.tsx         ← NUEVA
        └── index.ts                  ← NUEVA (exports)
```

---

### **1.2 Implementar Componentes Base**

#### **A. DifficultyBadge.tsx** (Más simple)

**Propósito:** Badge visual para mostrar nivel de dificultad

**Props:**
```typescript
interface DifficultyBadgeProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  size?: 'small' | 'medium' | 'large';
}
```

**Características:**
- Colores diferenciados:
  - `beginner` → Verde claro (#4CAF50)
  - `intermediate` → Naranja (#FF9800)
  - `advanced` → Rojo (#F44336)
- Texto traducido:
  - `beginner` → "Principiante"
  - `intermediate` → "Intermedio"
  - `advanced` → "Avanzado"
- Icono opcional según nivel

**Integración:**
```typescript
// Usado en TemplateDetailScreen header
<DifficultyBadge level={template.difficulty_level} />

// Usado en ExerciseDetailCard
<DifficultyBadge level={exercise.difficulty} size="small" />
```

---

#### **B. CategoryBadge.tsx**

**Propósito:** Badge para categoría de ejercicio

**Props:**
```typescript
interface CategoryBadgeProps {
  category: 'strength' | 'cardio' | 'flexibility' | 'balance';
  showIcon?: boolean;
}
```

**Características:**
- Iconos por categoría:
  - `strength` → barbell-outline
  - `cardio` → heart-outline
  - `flexibility` → body-outline
  - `balance` → fitness-outline
- Colores del tema Villa Mitre
- Texto traducido

**Integración:**
```typescript
// En ExerciseDetailCard
<CategoryBadge category={exercise.category} showIcon={true} />
```

---

#### **C. ExerciseDetailCard.tsx** (Componente complejo)

**Propósito:** Mostrar toda la información de un ejercicio dentro de un set

**Props:**
```typescript
interface ExerciseDetailCardProps {
  setExercise: SetExercise;  // Incluye exercise anidado
  index: number;              // Orden en el set
  expanded?: boolean;         // Colapsado/expandido
  onToggle?: () => void;      // Callback para expandir
}
```

**Campos a Mostrar:**

**Header (Siempre visible):**
```yaml
□ index + 1 (número de ejercicio en badge)
□ exercise.name (título principal)
□ repetitions (ej: "12 reps" o "A determinar")
□ weight_kg (si existe: "15kg" o "15.5kg")
□ duration_seconds (si existe: "5:00 min")
□ rest_after_seconds ("Descanso: 30seg")
```

**Expandido (Al hacer click):**
```yaml
□ exercise.image_url (imagen grande)
□ exercise.description (texto)
□ exercise.category (badge)
□ exercise.muscle_group (badge con icono)
□ exercise.difficulty (badge de dificultad)
□ exercise.equipment_needed (lista de items)
□ exercise.instructions (paso a paso numerado)
□ exercise.video_url (botón "Ver Video" → abre URL)
□ notes (notas específicas para esta ejecución)
□ distance_meters (si cardio)
```

**Estados:**
- Colapsado: Solo info básica (altura ~80px)
- Expandido: Info completa (altura dinámica)
- Loading: Si imagen tarda en cargar
- Sin imagen: Placeholder con icono

**Integración:**
```typescript
// En SetCard, dentro del map de exercises
{set.exercises.map((setExercise, idx) => (
  <ExerciseDetailCard
    key={setExercise.id}
    setExercise={setExercise}
    index={idx}
    expanded={expandedExercises[setExercise.id]}
    onToggle={() => toggleExercise(setExercise.id)}
  />
))}
```

---

#### **D. SetCard.tsx** (Componente contenedor)

**Propósito:** Mostrar un set completo con todos sus ejercicios

**Props:**
```typescript
interface SetCardProps {
  set: Set;
  index: number;  // Orden del set (1, 2, 3...)
  expanded: boolean;
  onToggle: () => void;
}
```

**Campos a Mostrar:**

**Header:**
```yaml
□ index + 1 (número del set)
□ set.name (título)
□ set.type (badge: "Normal" / "Superset" / "Circuit")
□ Cantidad de ejercicios (ej: "4 ejercicios")
□ Icono de expandir/contraer
```

**Body (cuando está expandido):**
```yaml
□ set.notes (si existe, en box destacado)
□ Lista de exercises (usando ExerciseDetailCard)
□ rest_after_set_seconds (destacado al final)
```

**Características:**
- Animación smooth al expandir/contraer
- Borde izquierdo de color según type:
  - `normal` → Verde
  - `superset` → Naranja
  - `circuit` → Azul
- Contador de ejercicios completados (preparado para futuro)

**Integración:**
```typescript
// En TemplateDetailScreen
{template.sets
  .sort((a, b) => a.order - b.order)
  .map((set, idx) => (
    <SetCard
      key={set.id}
      set={set}
      index={idx}
      expanded={expandedSets[set.id] || false}
      onToggle={() => toggleSet(set.id)}
    />
  ))}
```

---

### **1.3 Implementar TemplateDetailScreen**

**Propósito:** Pantalla principal que muestra el detalle completo de una rutina

**Navigation Params:**
```typescript
type TemplateDetailParams = {
  templateId: number;
  templateName: string;  // Para mostrar mientras carga
};
```

**Estados del Componente:**
```typescript
const [template, setTemplate] = useState<DailyTemplate | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [expandedSets, setExpandedSets] = useState<{[key: number]: boolean}>({});
const [expandedExercises, setExpandedExercises] = useState<{[key: number]: boolean}>({});
```

**Estructura Visual:**

```
┌────────────────────────────────────┐
│ ← RUTINA FUERZA A                 │ ← Header con back button
├────────────────────────────────────┤
│ ╔══════════════════════════════╗   │
│ ║ INFORMACIÓN GENERAL          ║   │
│ ╠══════════════════════════════╣   │
│ ║ 📋 Descripción               ║   │
│ ║ Entrenamiento completo...    ║   │
│ ║                              ║   │
│ ║ ⏱️ 60 min  🎯 Intermedio    ║   │
│ ║ 📊 3 sets  💪 12 ejercicios ║   │
│ ╚══════════════════════════════╝   │
├────────────────────────────────────┤
│ ┌────────────────────────────┐     │
│ │ SET 1: Calentamiento    [v]│     │ ← SetCard expandido
│ ├────────────────────────────┤     │
│ │ Nota: Empezar suave        │     │
│ │                            │     │
│ │ ╔═══ 1. Sentadillas ═══╗   │     │ ← ExerciseDetailCard
│ │ ║ 🏋️ 12 reps           ║   │     │
│ │ ║ ⏸️ 30seg descanso     ║   │     │
│ │ ║ [Expandir detalles]   ║   │     │
│ │ ╚═══════════════════════╝   │     │
│ │                            │     │
│ │ ╔═══ 2. Flexiones ══════╗   │     │
│ │ ║ ...                    ║   │     │
│ │ ╚═══════════════════════╝   │     │
│ │                            │     │
│ │ 💤 Descanso: 60 segundos   │     │
│ └────────────────────────────┘     │
│                                    │
│ ┌────────────────────────────┐     │
│ │ SET 2: Fuerza          [>] │     │ ← SetCard colapsado
│ └────────────────────────────┘     │
│                                    │
│ ┌────────────────────────────┐     │
│ │ SET 3: Finalización    [>] │     │
│ └────────────────────────────┘     │
└────────────────────────────────────┘
```

**Funciones Auxiliares:**

```typescript
const loadTemplate = async () => {
  try {
    setLoading(true);
    const data = await gymService.getTemplateDetails(templateId);
    setTemplate(data);
  } catch (err) {
    setError('Error al cargar la rutina');
  } finally {
    setLoading(false);
  }
};

const toggleSet = (setId: number) => {
  setExpandedSets(prev => ({
    ...prev,
    [setId]: !prev[setId]
  }));
};

const toggleExercise = (exerciseId: number) => {
  setExpandedExercises(prev => ({
    ...prev,
    [exerciseId]: !prev[exerciseId]
  }));
};

const getTotalExercises = (): number => {
  return template?.sets.reduce((sum, set) => sum + set.exercises.length, 0) || 0;
};
```

**Estados a Manejar:**
- Loading: Skeleton placeholder mientras carga
- Error: Pantalla de error con botón retry
- Empty: Si template no tiene sets (no debería pasar)
- Success: Mostrar todo el contenido

**Integración con Navegación:**

```typescript
// Registrar en HomeScreen.tsx después de la ruta Gimnasio
<Drawer.Screen 
  name="TemplateDetails" 
  component={TemplateDetailScreen}
  options={{ 
    headerTitle: 'Detalle de Rutina',
    headerShown: true 
  }}
/>
```

---

### **1.4 Crear Barrel Export**

**src/components/gym/index.ts:**

```typescript
export { SetCard } from './SetCard';
export { ExerciseDetailCard } from './ExerciseDetailCard';
export { DifficultyBadge } from './DifficultyBadge';
export { CategoryBadge } from './CategoryBadge';

// Re-export types for convenience
export type { Set, SetExercise, ExerciseDetails } from '../../types/gym';
```

---

## 🧪 PLAN DE PRUEBAS - FASE 1

### **Checklist de Verificación:**

```yaml
□ DifficultyBadge muestra colores correctos
□ DifficultyBadge traduce textos correctamente
□ CategoryBadge muestra iconos apropiados
□ ExerciseDetailCard muestra todos los campos
□ ExerciseDetailCard expande/contrae correctamente
□ ExerciseDetailCard maneja imagen faltante
□ ExerciseDetailCard formatea peso decimal (7.5kg)
□ ExerciseDetailCard formatea duración (5:00)
□ SetCard muestra info del set correctamente
□ SetCard expande lista de ejercicios
□ SetCard aplica color según tipo
□ TemplateDetailScreen carga datos correctamente
□ TemplateDetailScreen maneja loading state
□ TemplateDetailScreen maneja error state
□ TemplateDetailScreen calcula totales correctamente
□ Navegación desde GimnasioScreen funciona
□ Back button regresa a GimnasioScreen
□ Todos los textos en español
□ Scroll funciona correctamente
□ Performance con rutinas grandes (>20 ejercicios)
```

### **Casos de Prueba:**

**1. Rutina Simple:**
- 1 set, 3 ejercicios
- Sin imágenes ni videos
- Campos básicos

**2. Rutina Completa:**
- 3 sets, 12 ejercicios
- Con imágenes y videos
- Todos los campos poblados
- Pesos decimales
- Duraciones largas

**3. Rutina Compleja:**
- 5 sets, 30+ ejercicios
- Supersets y circuits
- Notas en todos los niveles
- Equipamiento diverso

**4. Edge Cases:**
- Repetitions = null → "A determinar"
- weight_kg = 7.5 → "7.5kg"
- duration_seconds = 300 → "5:00 min"
- video_url = null → No mostrar botón
- image_url = null → Placeholder

---

## ⏱️ ESTIMACIÓN DE TIEMPO - FASE 1

```yaml
DifficultyBadge:      30 min
CategoryBadge:        30 min
ExerciseDetailCard:   2 horas
SetCard:              1.5 horas
TemplateDetailScreen: 2 horas
Testing & Fixes:      1 hora
Integration:          30 min
─────────────────────────────
TOTAL FASE 1:         ~8 horas
```

---

## 🎯 FASE 2: CALENDARIO SEMANAL

### **2.1 Crear Archivos**

```
src/
├── screens/
│   └── gym/
│       └── WeeklyScheduleScreen.tsx  ← NUEVA
│
└── components/
    └── gym/
        └── WeekDayCard.tsx           ← NUEVA
```

---

### **2.2 Implementar WeekDayCard**

**Props:**
```typescript
interface WeekDayCardProps {
  day: WeekDay;
  templates: ScheduledTemplate[];
  isToday: boolean;
  onTemplatePress: (templateId: number, templateName: string) => void;
}
```

**Características:**
- Día destacado si es hoy (borde verde)
- Lista de rutinas del día
- Cada rutina muestra duración y nombre
- Click navega a TemplateDetails
- Empty state si no hay rutinas

---

### **2.3 Implementar WeeklyScheduleScreen**

**Estados:**
```typescript
const [schedule, setSchedule] = useState<WeeklyScheduleResponse['schedule'] | null>(null);
const [loading, setLoading] = useState(true);
const [selectedWeek, setSelectedWeek] = useState(0); // 0 = actual, 1 = próxima
```

**Funcionalidad:**
- Llama a `gymService.getWeeklySchedule()`
- Mapea 7 días de la semana
- Identifica día actual
- Navegación a TemplateDetails

**Integración:**

```typescript
// Agregar botón en GimnasioScreen antes de lista de rutinas
<TouchableOpacity 
  style={styles.calendarButton}
  onPress={() => navigation.navigate('WeeklySchedule')}
>
  <Ionicons name="calendar-outline" size={20} color={COLORS.WHITE} />
  <Text style={styles.calendarButtonText}>Ver Calendario Semanal</Text>
</TouchableOpacity>

// Registrar ruta en HomeScreen.tsx
<Drawer.Screen 
  name="WeeklySchedule" 
  component={WeeklyScheduleScreen}
  options={{ headerTitle: 'Calendario Semanal' }}
/>
```

---

## ⏱️ ESTIMACIÓN - FASE 2

```yaml
WeekDayCard:          45 min
WeeklyScheduleScreen: 1.5 horas
Integration:          30 min
Testing:              45 min
─────────────────────────────
TOTAL FASE 2:         ~3.5 horas
```

---

## 🎯 FASE 3: BIBLIOTECA DE EJERCICIOS (OPCIONAL)

**Implementación posterior si se requiere.**

---

## 📦 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
Día 1 (Mañana):
1. ✅ DifficultyBadge (30 min)
2. ✅ CategoryBadge (30 min)
3. ✅ ExerciseDetailCard (2 horas)

Día 1 (Tarde):
4. ✅ SetCard (1.5 horas)
5. ✅ TemplateDetailScreen (2 horas)

Día 2 (Mañana):
6. ✅ Testing Fase 1 (1 hora)
7. ✅ Integration & Fixes (30 min)

Día 2 (Tarde):
8. ✅ WeekDayCard (45 min)
9. ✅ WeeklyScheduleScreen (1.5 horas)
10. ✅ Testing Fase 2 (45 min)
```

---

## ✅ CHECKLIST FINAL

```yaml
FASE 1 - DETALLE DE RUTINA:
□ Todos los componentes creados
□ Todos los campos visibles
□ Navegación funcionando
□ Loading states implementados
□ Error handling implementado
□ Tests manuales pasados
□ Performance aceptable

FASE 2 - CALENDARIO:
□ WeekDayCard implementado
□ WeeklyScheduleScreen funcionando
□ Integración con GimnasioScreen
□ Navegación completa

INTEGRACIÓN GENERAL:
□ Sin errores de TypeScript
□ Sin warnings de React
□ Todos los textos en español
□ Colores Villa Mitre aplicados
□ Responsive en diferentes tamaños
□ Funciona en Android
□ Funciona en iOS
```

---

## 🚀 READY TO START

**Orden sugerido de implementación:**
1. DifficultyBadge → Más simple, prueba el sistema
2. CategoryBadge → Similar al anterior
3. ExerciseDetailCard → Componente clave
4. SetCard → Usa ExerciseDetailCard
5. TemplateDetailScreen → Orquesta todo

**¿Comenzamos con DifficultyBadge para probar el flujo?**
