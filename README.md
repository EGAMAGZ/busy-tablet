# BUSY Bar

Temporizador de foco multiplataforma (tablet/móvil) — Preact + Ionic +
Capacitor. Offline-first, sin cuentas ni backend, diseño monocromático
(Nothing design system).

## Características
- Pomodoro por ciclos (trabajo / descanso / descanso largo) con XState.
- Modo CUSTOM (mensaje + emoji + cronómetro).
- Pausa/reanudación que conserva el tiempo restante.
- Gestos: swipe ↑/↓ = ±1 min, doble tap = play/pause.
- Estadísticas locales (sesiones, minutos, horas, racha).
- Haptics y notificaciones locales (Capacitor).
- PWA instalable (web).

## Paquetes
| Paquete | Descripción |
|---|---|
| `@busy-bar/shared` | Motor de sesión, storage, utils (sin UI) |
| `@busy-bar/design-tokens` | Tailwind config + CSS Nothing DS |
| `@busy-bar/web` | App Preact + Vite PWA |
| `@busy-bar/mobile` | App Preact + Ionic + Capacitor |

## Inicio rápido
```bash
pnpm install
pnpm dev:web
```
Ver `docs/SETUP.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`.
