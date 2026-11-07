# Reto Yape

Aplicación Android con React Native, TypeScript y Kotlin. Incluye login con Firebase, cuentas y tarjetas de prueba, consulta segura de datos y beneficios en un mapa sincronizado con un carrusel.

## Instalación

Requisitos: Node 24, JDK 17, Android Studio, SDK 37, Build Tools 37.0.0, NDK 27.1.12297006 y un dispositivo Android con Google Play Services.

```bash
npm ci
```

La configuración local se encuentra en `android/local.properties`, excluido de Git:

```properties
sdk.dir=/ruta/al/Android/sdk
MAPS_API_KEY=clave_de_maps
```

La clave requiere **Maps SDK for Android** habilitado y restricciones por API, paquete `com.iochallenge` y SHA-1 del certificado. El comando `cd android && ./gradlew signingReport` muestra las huellas. `MAPS_API_KEY` también puede definirse como variable de entorno y tiene prioridad sobre el archivo local.

Firebase requiere una app Android con el mismo paquete y el proveedor **Correo electrónico/contraseña** habilitado. El archivo descargado de Firebase Console se coloca en `android/app/google-services.json`, también excluido de Git.

La aplicación se inicia con el emulador abierto y dos terminales en la raíz del proyecto:

```bash
npm start
```

```bash
npm run android
```

Debug obtiene el JavaScript desde Metro y permite Fast Refresh. Si falla la conexión, `adb reverse tcp:8081 tcp:8081` habilita el acceso desde el emulador. Los cambios en Kotlin, Gradle o las claves requieren recompilar.

## Cuenta de prueba

| Correo              | Contraseña      |
| ------------------- | --------------- |
| `demo@retoyape.com` | `RetoYape2026!` |

El usuario está creado en Firebase Authentication. Un login correcto abre el Dashboard. El SDK restaura la sesión al reiniciar; **TÚ → Salir** la cierra y desmonta la navegación privada. La app no ofrece registro ni almacena la contraseña.

## Estructura

```text
src/
  app/                  Catálogo compartido y encabezado con sesión
  features/
    auth/               Login, sesión y adaptador Firebase
    products/           Cuentas, tarjetas y apertura segura
    benefits/           Elegibilidad, filtros y sincronización
  shared/               Tema, iconos y componentes visuales
packages/io-native/     Contratos TypeScript y módulo Android propio
```

Las reglas de negocio son funciones independientes de React. `CatalogRepository`, `Authentication` y `SecurityGateway` permiten sustituir la infraestructura en pruebas. Context comparte catálogo y sesión; cada pantalla conserva su estado local.

## API nativa

`@io/native` expone un componente Fabric y un TurboModule con Codegen. El mapa utiliza directamente Google Maps SDK, sin wrappers de React Native.

```tsx
<CustomMap
  markers={markers}
  selectedMarkerId={selectedId}
  cameraResetKey={cameraResetKey}
  onMarkerPress={event => setSelectedId(event.nativeEvent.markerId)}
  onMapReady={() => setMapReady(true)}
  onMapError={() => setMapUnavailable(true)}
/>
```

Cada marcador contiene `id`, `title`, `latitude` y `longitude`. `selectedMarkerId` resalta la selección; incrementar `cameraResetKey` encuadra todos los marcadores. El nativo descarta IDs repetidos y coordenadas inválidas. `onMapReady` confirma que el controlador está disponible; no garantiza la autorización de la clave ni la descarga de tiles.

La vista segura recibe únicamente `cardId` y un token opaco:

```ts
const token = await IoSecurity.requestMockSecureToken(cardId);
await IoSecurity.openSecureView(cardId, token);
```

El hook `useSecureCard` controla errores, bloquea aperturas simultáneas y renueva el token en cada solicitud. La suscripción a eventos se retira al desmontar:

```ts
useEffect(() => {
  const subscription = IoSecurity.onSecureEvent(handleSecureEvent);
  return () => subscription.remove();
}, []);
```

| Evento               | Información                                         |
| -------------------- | --------------------------------------------------- |
| `onSecureViewOpened` | `cardId`                                            |
| `onCardDataShown`    | `cardId`                                            |
| `onValidationError`  | `cardId`, `code`: `TOKEN_INVALID` o `TOKEN_EXPIRED` |
| `onSecureViewClosed` | `cardId`, `reason`: `USER_DISMISS` o `TIMEOUT`      |

Todos los eventos incluyen `type`, `cardId`, `code` y `reason`; los campos no aplicables son strings vacíos. La apertura también puede rechazar `CARD_NOT_FOUND`, `ACTIVITY_UNAVAILABLE`, `SESSION_ACTIVE` u `OPEN_FAILED`.

Los casos de token inválido y vencido se verifican en las pruebas automatizadas. El contrato conserva `requestDemoToken` para pruebas en debug; esta operación devuelve `DEMO_UNAVAILABLE` en release. La interfaz de la app no incluye controles de prueba.

## Pruebas y formato

```bash
npm test
npm run coverage
npm run check
```

`npm test` ejecuta Jest/RNTL y JUnit con un solo comando. La cobertura TypeScript exige al menos 70 % en statements, branches, functions y lines. Los reportes se generan en `coverage/lcov-report/index.html` y `packages/io-native/android/build/reports/tests/testDebugUnitTest/index.html`.

`npm run check` comprueba formato, tipos, lint y pruebas. Prettier formatea TypeScript, JavaScript y documentación; ktfmt aplica el estilo Kotlin con cuatro espacios. Los comandos `npm run format` y `npm run format:native` corrigen el formato.

## Seguridad y verificación

- PAN completo, CVV y titular ficticios existen solo en Kotlin. No cruzan hacia JavaScript.
- El token usa HMAC, caduca a los 60 segundos y se vincula a una tarjeta. El emisor es local y sirve únicamente para esta demostración.
- La Activity no está exportada. `FLAG_SECURE` bloquea capturas; una máscara cubre el contenido al pausar. La sesión vence a los 45 segundos, incluido el tiempo en segundo plano.
- **Ocultar datos** y Atrás cierran la sesión. El código propio no registra ni persiste tokens o datos sensibles.

La verificación comprende captura bloqueada, Home/Recientes, retorno desde segundo plano, timeout y cierre manual.

## APK

```bash
cd android
./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

El APK se genera en `android/app/build/outputs/apk/release/app-release.apk` y funciona sin Metro. La firma utiliza el certificado debug para la evaluación; la distribución productiva requiere un certificado propio. El alcance es Android; iOS y la publicación del paquete no están incluidos.

La fuente Plus Jakarta Sans y su licencia OFL están en `packages/io-native/android/src/main/assets/fonts/`. Las imágenes se incluyen en `src/assets/` y los iconos se dibujan con vectores.
