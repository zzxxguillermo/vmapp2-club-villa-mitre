# 🛡️ Villa Mitre App

> Aplicación oficial del Club Villa Mitre, desarrollada con tecnología de punta para brindar la mejor experiencia a los socios.

![Status](https://img.shields.io/badge/Status-Active-success) ![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue) ![Tech](https://img.shields.io/badge/Tech-React%20Native%20%7C%20Expo-violet)

## 📖 Sobre el Proyecto

Esta aplicación permite a los socios del Club Villa Mitre gestionar su carnet digital, acceder a beneficios exclusivos, consultar actividades deportivas y mantenerse al día con las novedades del club.

El proyecto ha sido recientemente refactorizado (2025) para adoptar una arquitectura **Feature-First**, gestión de estado moderna con **TanStack Query**, y optimizaciones de rendimiento avanzadas.

## � Enlaces Rápidos

Toda la documentación detallada se encuentra en la carpeta [`docs/`](./docs/):

*   **[⚙️ Guía de Configuración](./docs/SETUP.md)**: Cómo instalar y correr el proyecto desde cero.
*   **[🏗️ Arquitectura](./docs/ARCHITECTURE.md)**: Estructura de carpetas, patrones de diseño y decisiones técnicas.
*   **[🧪 Testing](./docs/TESTING.md)**: Estrategia de pruebas, mocks y cómo ejecutar los tests.
*   **[📚 Archivo Histórico](./docs/archive/)**: Logs de refactorización y análisis previos.

## 🛠️ Stack Tecnológico

*   **Core:** React Native (0.76+), Expo SDK 52
*   **Lenguaje:** TypeScript
*   **Estado Server:** TanStack Query (React Query) v5
*   **Estado Client:** Redux Toolkit (solo Auth)
*   **Navegación:** React Navigation v7
*   **UI/Estilos:** StyleSheet nativo, Expo Image, FlashList
*   **Motor JS:** Hermes (Optimized)
*   **Testing:** Jest, React Native Testing Library

## ✨ Optimizaciones Recientes

*   **FlashList:** Listas de alto rendimiento (5x más rápidas que FlatList).
*   **Expo Image:** Caché de imágenes avanzado y transiciones suaves.
*   **Hermes Engine:** Activado explícitamente para menor tiempo de inicio y consumo de memoria.
*   **Bundle Size:** Eliminación de dependencias pesadas (lodash) y tree-shaking optimizado.

## 🤝 Contribución

1.  Asegúrate de leer la **[Guía de Configuración](./docs/SETUP.md)**.
2.  Crea una rama para tu feature: `git checkout -b feature/mi-nueva-feature`.
3.  Sigue los patrones definidos en **[Arquitectura](./docs/ARCHITECTURE.md)**.
4.  Asegúrate de que los tests pasen: `npm test`.
5.  Abre un Pull Request.

---

**Desarrollado con 💚 para el Club Villa Mitre**
