# Deployment

## Web (PWA)
```bash
pnpm build:web        # -> packages/web/dist
```
Servir `dist/` por HTTPS (Netlify/Vercel/nginx). El service worker
(`vite-plugin-pwa`) cachea el shell; la app funciona 100% offline.

## iOS
```bash
pnpm -C packages/mobile exec cap add ios     # una vez
pnpm build:ios                                # abre Xcode
```
- Bundle id: `com.busybar.app`
- Deployment target: iOS 14+
- Firma + Archive → TestFlight.
- Permisos (`Info.plist`): `NSMicrophoneUsageDescription` (detección de
  llamadas, opcional).

## Android
```bash
pnpm -C packages/mobile exec cap add android  # una vez
pnpm build:android                             # abre Android Studio
```
- minSdk 28 (Android 9), target 34
- Permisos (`AndroidManifest.xml`): `RECORD_AUDIO` (opcional),
  `POST_NOTIFICATIONS` (Android 13+).
- `./gradlew bundleRelease` → Play Console.

## Versiones
El versionado vive en cada `package.json`; alinear antes de publicar
(`pnpm -r exec npm version <x.y.z>` o manual).

## Checklist
- [ ] `pnpm typecheck` y `pnpm lint` en verde
- [ ] `pnpm build:all` sin warnings de tamaño
- [ ] Probado en tablet real (iPad 7–12" y Android)
