# Arquitectura

BUSY Bar es **offline-first y local-only**: no hay backend ni cuentas. Todo el
estado vive en el dispositivo (localStorage / Preferences). Web y mobile
comparten el mismo motor de sesión.

## Capas

```
@busy-bar/shared            @busy-bar/design-tokens
  sessionMachine (XState)     tailwind.config.js
  sessionController           globals.css  (variables)
  utils/storage               nothing.css  (@layer components)
  utils/{time,audio,...}
        │
        ├──────────────► packages/web      (Preact + Vite PWA)
        └──────────────► packages/mobile   (Preact + Ionic + Capacitor)
```

## Motor de sesión

`sessionController.ts` envuelve la máquina XState y expone una API
framework-agnóstica (`start/pause/resume/toggle/stop/adjustSeconds` + `subscribe`).
Las apps sólo consumen el controller; no conocen XState.

Máquina (`sessionMachine.ts`) — estados:
`idle → working ⇄ paused → resuming → resting ⇄ … → longRest → completed`.

- `after` delays (`workDelay`, `restDelay`, `longRestDelay`) auto-avanzan fases.
- `PAUSE` guarda `remainingMs` en contexto; `RESUME` entra a `resuming` que
  consume **sólo** el tiempo restante (no reinicia la fase) vía `resumeDelay`.
- El controller tiene un *backstop* (`COMPLETE`) por si el navegador throttlea
  los timers en background.
- Efectos (`playSound`, `vibrate`, `notify*`) son inyectados por cada app
  (WebAudio/Notification en web; Haptics/LocalNotifications en mobile).

## Persistencia

`utils/storage.ts` (localStorage): `busy.sessions`, `busy.config`, `busy.theme`,
`busy.custom.*`. En mobile Capacitor Preferences puede respaldar el mismo shape.

## Decisiones

- **Sin backend:** se descartó `packages/server`, `api/`, Firebase y el sync
  remoto. `SessionRecord` conserva `deviceId`/`syncedAt` opcionales para un
  futuro sync, pero no se usan.
- **`@xstate/preact` no existe** en npm; el controller suscribe con `createActor`.
- **Estado de sesión a nivel App**: `useSession()` se llama una vez en `App` para
  que la sesión sobreviva al cambio de pestaña.
