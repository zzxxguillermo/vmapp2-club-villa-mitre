# 🔍 DEBUG LOGS ACTIVADOS

**Fecha:** Octubre 12, 2025 - 17:02  
**Objetivo:** Identificar estructura real de datos de ejercicios y sets

---

## 📊 LOGS AGREGADOS

### **1. gymService.ts - getTemplateDetails()**
```
📋 Template details from backend: {JSON completo del template}
📋 Exercises from backend (COMPLETO): {JSON completo del array}
📋 Cantidad de ejercicios: X
📋 ESTRUCTURA DEL PRIMER EJERCICIO: {JSON del primer ejercicio}
```

### **2. gymService.ts - mapExercisesToSets()**
```
🏋️ Mapping exercises, first exercise: {JSON del primer ejercicio}
🔍 Ejercicio mapeado: {
  nombre: "...",
  grupoMuscular: "...",
  repeticiones: X,
  peso: X
}
```

### **3. ExerciseDetailCard.tsx**
```
🏋️ ExerciseDetailCard - setExercise completo: {JSON del setExercise}
```

---

## 🎯 LO QUE NECESITAMOS VER

### **Estructura Esperada del Backend:**

Según mencionas, cada ejercicio tiene sus propios sets. Puede ser algo como:

```json
{
  "exercises": [
    {
      "id": 1,
      "exercise": {
        "id": 101,
        "name": "Sentadillas",
        "description": "...",
        ...
      },
      "sets": [
        {
          "set_number": 1,
          "repetitions": 12,
          "weight_kg": 50,
          "rest_after_seconds": 30
        },
        {
          "set_number": 2,
          "repetitions": 10,
          "weight_kg": 55,
          "rest_after_seconds": 30
        },
        {
          "set_number": 3,
          "repetitions": 8,
          "weight_kg": 60,
          "rest_after_seconds": 60
        }
      ]
    }
  ]
}
```

O puede ser:

```json
{
  "exercises": [
    {
      "id": 1,
      "name": "Sentadillas",
      "sets": 3,
      "repetitions": "12-10-8",
      "weight_kg": "50-55-60",
      ...
    }
  ]
}
```

---

## 📝 PASOS PARA DEBUG

### **1. Recarga la App:**
```
Presiona 'r' en terminal de Expo
```

### **2. Entra a Gimnasio:**
```
Centro Deportivo → Gimnasio
```

### **3. Click en una Rutina:**
```
Verás los logs en consola mostrando la estructura EXACTA
```

### **4. Comparte los Logs:**
```
Copia los logs que empiezan con:
📋 ESTRUCTURA DEL PRIMER EJERCICIO: {...}
```

---

## 🔄 UNA VEZ QUE VEAMOS LA ESTRUCTURA REAL

Podremos:

### **Opción A: Ejercicio con Array de Sets**
```typescript
// Si viene así:
exercise.sets = [
  { set_number: 1, reps: 12, weight: 50 },
  { set_number: 2, reps: 10, weight: 55 },
  { set_number: 3, reps: 8, weight: 60 }
]

// Mostraremos:
SET 1: 12 reps × 50kg
SET 2: 10 reps × 55kg  
SET 3: 8 reps × 60kg
```

### **Opción B: Ejercicio con Datos Consolidados**
```typescript
// Si viene así:
exercise.sets = 3
exercise.repetitions = "12-10-8"
exercise.weight_kg = "50-55-60"

// Mostraremos:
3 sets: 12/10/8 reps × 50/55/60kg
```

### **Opción C: SetExercise con Parámetros Únicos**
```typescript
// Si viene así (actual):
setExercise.repetitions = 12
setExercise.weight_kg = 50

// Es un set único por ejercicio
```

---

## ⚡ ESTADO ACTUAL

```yaml
Logs: ✅ ACTIVADOS
Estructura: ❓ POR IDENTIFICAR
Mapeo: ⏳ PENDIENTE DE AJUSTAR
```

---

## 📌 PRÓXIMO PASO

**RECARGA LA APP Y COMPARTE LOS LOGS** 

Específicamente el log que dice:
```
📋 ESTRUCTURA DEL PRIMER EJERCICIO: {...}
```

Con eso sabré exactamente cómo mapear los datos correctamente.
