# Guía de Configuración del Entorno

Sigue estos pasos para configurar tu entorno de desarrollo y ejecutar la aplicación Villa Mitre.

## 📋 Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu sistema:

1.  **Node.js**: Versión 18 o superior (Recomendado: LTS).
    *   [Descargar Node.js](https://nodejs.org/)
2.  **Git**: Para control de versiones.
3.  **Expo CLI**: Aunque se puede usar `npx`, es útil tenerlo global.
    ```bash
    npm install -g expo-cli
    ```
4.  **EAS CLI**: Para gestionar builds y credenciales.
    ```bash
    npm install -g eas-cli
    ```
5.  **Simuladores (Opcional pero recomendado):**
    *   **Android Studio**: Para emulador de Android.
    *   **Xcode** (Solo macOS): Para simulador de iOS.

## 🚀 Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPO>
    cd vmapp2
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
    *Nota: Si encuentras errores de dependencias nativas, intenta `npx expo install`.*

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example` (si existe) o usa los valores por defecto configurados en `app.json` / `src/utils/environment.ts`.

## 📱 Ejecución

### Modo Desarrollo (Expo Go)

La forma más rápida de empezar.

```bash
npm start
```

Escanea el código QR con la app **Expo Go** en tu dispositivo físico (Android/iOS) o presiona `a` para abrir en Android Emulator / `i` para iOS Simulator.

### Modo Desarrollo (Build Nativo / Development Client)

Si necesitas probar librerías nativas que no están en Expo Go.

```bash
# Android
npm run android

# iOS
npm run ios
```

## 📦 Generación de Builds (APK/AAB)

Usamos **EAS Build** para generar los binarios.

1.  **Login en Expo:**
    ```bash
    eas login
    ```

2.  **Configurar proyecto (si es la primera vez):**
    ```bash
    eas build:configure
    ```

3.  **Generar APK (Android):**
    ```bash
    npm run build:apk
    # O comando manual:
    eas build --profile production-apk --platform android
    ```

4.  **Generar AAB (Play Store):**
    ```bash
    npm run submit:playstore
    # O comando manual:
    eas build --profile production --platform android
    ```

## 🛠️ Solución de Problemas

*   **Error de Metro Bundler:** Si el bundler se queda pegado, intenta limpiar el caché:
    ```bash
    npm start -- --reset-cache
    ```
*   **Error de Dependencias Nativas:** Si agregaste una librería nueva, asegúrate de reconstruir el cliente de desarrollo (`npm run android` / `npm run ios`) o usar Expo Go si es compatible.
