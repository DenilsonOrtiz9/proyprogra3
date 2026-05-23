# Sistema de Gestión de Servicio Técnico

Este proyecto consiste en una aplicación móvil para la gestión de órdenes de servicio en un taller técnico y un backend robusto en Spring Boot.

## Requisitos
- Java 17 o superior
- Maven
- Node.js & npm
- Dispositivo móvil con **Expo Go** (para probar la app)

## Estructura del Proyecto
- `/backend`: API REST construida con Spring Boot y H2 (base de datos en memoria/archivo).
- `/frontend`: Aplicación móvil construida con React Native y Expo SDK 54.

## Instrucciones para Ejecutar

### 1. Backend (Spring Boot)
1. Navega a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Ejecuta la aplicación:
   ```bash
   mvn spring-boot:run
   ```
3. La API estará disponible en `http://localhost:8080`. Puedes acceder a la consola de H2 en `http://localhost:8080/h2-console`.

### 2. Frontend (React Native / Expo)
1. Navega a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. **IMPORTANTE:** Debes configurar la dirección IP de tu máquina en los siguientes archivos para que el dispositivo móvil pueda conectarse al backend:
   - `src/services/api.ts` (Variable `BASE_URL`)
   - `src/screens/OrderDetailScreen.tsx` (URL de las imágenes)
   - `src/screens/ClientTrackingScreen.tsx` (URL de las imágenes)
3. Instala las dependencias (si no se han instalado):
   ```bash
   npm install
   ```
4. Inicia Expo:
   ```bash
   npx expo start
   ```
5. Escanea el código QR con la app **Expo Go** en tu dispositivo móvil.

## Funcionalidades
- **Técnico:**
  - Crear órdenes de servicio con datos del cliente y dispositivo.
  - Capturar fotografías como evidencia inicial usando la cámara.
  - Listar órdenes existentes.
  - Actualizar el estado de la reparación (Recibido, En diagnóstico, En reparación, Listo, Entregado).
- **Cliente:**
  - Consultar el estado de su orden mediante el número de orden.
  - Visualizar una línea de tiempo del progreso.
  - Ver las fotos tomadas al momento de la recepción.
