# Setup

## Requisitos
- Node 20+ (probado en 26)
- pnpm 9+ (`corepack enable`)
- Xcode 15+ (solo iOS) · Android Studio + SDK 34 (solo Android)

## Instalación
```bash
corepack enable
pnpm install
```

## Desarrollo
```bash
pnpm dev:web      # http://localhost:5173
pnpm dev:mobile   # http://localhost:5173 (web assets; ver Capacitor abajo)
```

## Verificación
```bash
pnpm typecheck    # tsc --noEmit en todos los paquetes
pnpm build:all    # build de web y mobile
pnpm lint
```

## Capacitor (nativo)
```bash
pnpm -C packages/mobile exec cap add ios
pnpm -C packages/mobile exec cap add android
pnpm build:ios       # vite build + cap sync + abre Xcode
pnpm build:android   # vite build + cap sync + abre Android Studio
```

## Estructura
```
packages/
  shared/         # tipos, estado (XState), storage, utils — sin UI
  design-tokens/  # Tailwind config (Nothing DS) + CSS
  web/            # Preact + Vite PWA
  mobile/         # Preact + Ionic + Capacitor
```
