# BUSY Tablet - App Multiplataforma con Preact + Ionic | Prompt de Desarrollo

## Rol y Objetivo
Eres un ingeniero senior fullstack de apps híbridas. Desarrollas las features core de BUSY Bar como **aplicación multiplataforma con Preact + Ionic + Capacitor**.  
Alcance: **iOS + Android desde una base de código única (monorepo con pnpm)**.

---

## Qué es BUSY Bar (Web + Mobile Hybrid)
Una **app de productividad de foco** para tablet/móvil (7-12") que funciona en web y nativo. Muestra tu estado "ocupado" en pantalla completa o widget. Combina un temporizador Pomodoro por intervalos, bloqueo de distracciones, sincronización con otros dispositivos y backend.

Filosofía: **offline-first** (funciona sin red), interfaz gestual intuitiva, rendimiento optimizado, sin ads, sin vendor lock-in, diseño monochromático (Nothing design system).

---

## Stack Tecnológico

### Frontend (Preact + Ionic)
- **Runtime:** Preact 10.x + Preact Router (alternativa: Preact Signals para state)
- **UI Framework:** Ionic 8.x (componentes nativos compilados con Capacitor)
- **Styling:** Tailwind CSS 3.x + Custom tokens Nothing design system
- **Package Manager:** pnpm 9.x (workspace monorepo)
- **Build:** Vite (soporte nativo Preact + Ionic)
- **TypeScript:** 5.x (tipado fuerte)

### Mobile (Capacitor)
- **iOS:** iOS 14.0+ (iPad mín. 7")
- **Android:** Android 9 (API 28+); recomendado 12+
- **Plugins Capacitor:**
  - `@capacitor/audio` (notificaciones sonoras)
  - `@capacitor/device` (batería, info dispositivo)
  - `@capacitor/geolocation` (opcional, para smart home)
  - `@capacitor/notification` (local + push)
  - `@capacitor/permissions` (micrófono, cámara, calendario)
  - `@capacitor-firebase/authentication` (login)
  - `@ionic-native/status-bar` y `safe-area` (UI nativa)

### Backend & Sync
- **API:** REST + WebSocket (mismo backend que dispositivo físico si existe)
- **Auth:** JWT + refresh tokens
- **Persistencia local:** SQLite vía `@capacitor-community/sqlite` o IndexedDB (web)
- **Sync:** Watermelon DB (reactive local-first) o Realm Mobile Sync
- **Notificaciones:** Firebase Cloud Messaging (FCM)

### Monorepo Structure (pnpm workspaces)
```
busy-bar/
├── pnpm-workspace.yaml
├── package.json (root)
├── packages/
│   ├── web/              # Preact + Vite (PWA)
│   ├── mobile/           # Ionic + Capacitor (iOS/Android)
│   ├── shared/           # Tipos, utilities, API client
│   │   ├── types/
│   │   ├── api/
│   │   └── constants/
│   ├── design-tokens/    # Tailwind config + Nothing DS
│   └── tests/            # e2e tests (Playwright)
```

---

## Design System: Nothing (Monochromatic + Typographic)

BUSY Bar usa el design system de Nothing: minimalismo industrial, jerarquía tipográfica, paleta monocromática, transparencia y detalles precisos.

### Tipografía (Google Fonts)
- **Display/Headlines:** Geist (900 weight) - títulos grandes (32-48px)
- **Body/UI:** Geist Sans (400, 500) - contenido principal (14-18px)
- **Mono/Metadata:** Geist Mono (400) - tiempos, stats, valores técnicos (12-14px)
- **Labels/CTA:** Geist Sans (500, uppercase) - botones, microcopy (11-13px)

### Paleta de Colores
```tailwind
- Blacks: #000000 (primary), #0A0A0A (OLED black)
- Whites: #FFFFFF (primary), #F5F5F5 (subtle background)
- Grays: #242424, #3F3F3F, #595959, #7F7F7F, #A8A8A8, #D0D0D0 (grayscale precise)
- Accent: Ninguno (la paleta es monochrome + uso de escala de grises para diferenciación)
- Surface: transparente con blur (glassmorphism sutil) | OLED: true black background
```

### Principios de Diseño
1. **Sin gradientes:** solo colores sólidos y transparencias
2. **Bordes:** radius 4px (minimal) o 6px (cards)
3. **Espaciado:** Múltiplos de 4px (Tailwind default compatible)
4. **Jerarquía:** Únicamente tipografía (tamaño + weight) y densidad espacial
5. **Iconografía:** Geist Icons (SF Symbols iOS, Material Icons Android via Ionic)
6. **Transparencia:** detalles transparentes en cards, overlays con backdrop-blur
7. **No decoración:** cada elemento tiene propósito funcional
8. **Dark first:** modo oscuro como default, light mode para accesibilidad

### Componentes Reutilizables (Tailwind + Ionic)
```html
<!-- Button -->
<button class="px-4 py-3 rounded-md bg-black text-white text-sm font-medium uppercase hover:bg-gray-900 transition-colors">
  Play
</button>

<!-- Card (transparent glassmorphism) -->
<div class="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg p-6">
  Content
</div>

<!-- Progress bar (segmented) -->
<div class="flex gap-1 h-1 bg-gray-800 rounded-full overflow-hidden">
  <div class="flex-1 bg-black"></div>
  <div class="flex-1 bg-gray-600"></div>
</div>

<!-- Timer display (monospaced) -->
<span class="text-6xl font-mono font-bold text-black tracking-tight">25:00</span>
```

---

## UI/UX Core

### Pantalla Principal (Foco)
```jsx
// App.jsx
<ion-page>
  <ion-content class="!bg-black">
    {/* Full-screen timer */}
    <div class="flex flex-col items-center justify-center h-screen gap-8 px-6">
      
      {/* Fase actual */}
      <h2 class="text-gray-400 text-lg font-mono uppercase tracking-wide">
        {currentPhase.name}
      </h2>

      {/* Timer display - Geist Mono, extra-large */}
      <time class="text-8xl md:text-9xl font-mono font-bold text-white tabular-nums">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </time>

      {/* Progreso circular */}
      <svg class="w-40 h-40" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#3F3F3F" strokeWidth="2" />
        <circle 
          cx="100" cy="100" r="90" 
          fill="none" stroke="#FFFFFF" strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.3s' }}
        />
      </svg>

      {/* Ciclo actual */}
      <p class="text-sm text-gray-500 font-mono">
        Ciclo {currentCycle} de {totalCycles}
      </p>
    </div>

    {/* Bottom control bar - Ionic sticky */}
    <div class="fixed bottom-0 left-0 right-0 flex gap-4 justify-center p-6 bg-gradient-to-t from-black to-transparent">
      <ion-button 
        class="!bg-white !text-black !rounded-md"
        onClick={handlePlayPause}
      >
        {isRunning ? 'PAUSE' : 'PLAY'}
      </ion-button>
      
      <ion-button 
        class="!border !border-white !text-white !bg-transparent !rounded-md"
        onClick={handleStop}
      >
        STOP
      </ion-button>
    </div>
  </ion-content>
</ion-page>
```

### Modos (Ionic Segment - Nothing Style)
```jsx
<ion-segment 
  value={activeMode} 
  onIonChange={(e) => setActiveMode(e.detail.value)}
  class="!bg-gray-900 !rounded-lg !p-1"
>
  <ion-segment-button 
    value="busy"
    class="!text-gray-400 !border-0 [[aria-pressed=true]]:!bg-white [[aria-pressed=true]]:!text-black !rounded-md"
  >
    BUSY
  </ion-segment-button>
  <ion-segment-button value="custom">CUSTOM</ion-segment-button>
  <ion-segment-button value="stats">STATS</ion-segment-button>
  <ion-segment-button value="settings">⚙️</ion-segment-button>
</ion-segment>
```

### Estado Personalizado (CUSTOM mode)
```jsx
<ion-modal>
  {/* Input monocromo */}
  <ion-input 
    placeholder="En llamada..."
    class="!border-b !border-gray-600 !px-0 !text-white !text-lg"
  />
  
  {/* Emoji picker inline */}
  <div class="grid grid-cols-8 gap-4 mt-6">
    {emojiSet.map(emoji => (
      <button 
        key={emoji}
        onClick={() => setEmoji(emoji)}
        class="text-3xl hover:bg-gray-900 rounded transition"
      >
        {emoji}
      </button>
    ))}
  </div>

  {/* Preview */}
  <div class="mt-8 p-6 rounded-lg bg-gray-900 border border-gray-700">
    <p class="text-white text-center text-lg">{customText}</p>
    <p class="text-gray-400 text-center text-4xl">{emoji}</p>
  </div>
</ion-modal>
```

---

## Hardware & Sensores (Tablet)

### Pantalla
- **Resolución:** 1024×768 (iPad 7") hasta 2560×1600 (tablet 12")
- **Orientación:** landscape + portrait; split-view en iPad OS
- **Safe areas:** Capacitor maneja notches / Dynamic Island automáticamente
- **Modo oscuro:** OLED-first (true black #0A0A0A), light mode secundario (fallback accesibilidad)
- **Densidad:** DPI-aware (CSS pixels se escalan automáticamente)

### Sensores (vía Capacitor Plugins)
```typescript
// Device Capacitor API
const info = await Device.getInfo(); // model, osVersion, battery
const battery = await Battery.getBatteryStatus(); 
// → { level: 85, isCharging: false }

// Screen Capacitor
await ScreenBrightness.getBrightness(); // 0-1
await ScreenBrightness.setBrightness({ brightness: 0.5 });

// Permiso: micrófono (detect llamada)
const status = await Permissions.query({ name: 'microphone' });
if (status.state === 'granted') {
  // Iniciar MediaStream para medir level
}
```

### Audio & Haptic
- **Notificaciones sonoras:** [Capacitor Audio](https://capacitorjs.com/docs/apis/audio)
  - Sonidos: click (inicio), whoosh (fin fase), beep (alarma)
- **Vibración:** `Haptics.vibrate()` (iOS) + `Haptics.impact()` (Android 12+)
  - Lightweight (5ms): ajuste de tiempo
  - Medium (100ms): cambio de fase
  - Heavy (200ms): final sesión
- **Integración SO:** silenciar via Focus Mode (iOS 15+) + Do Not Disturb (Android 31+)
- **No music playback:** app no compite con Spotify/YouTube; users pueden escuchar mientras usan timer

---

## Features Core (Por Prioridad)

### 1. Motor de Sesión de Foco (State Machine)
**Arquitectura:** Preact Signals + XState (state machine library)

```typescript
// sessionMachine.ts (XState)
import { createMachine } from 'xstate';

export const sessionMachine = createMachine({
  id: 'session',
  initial: 'idle',
  states: {
    idle: {
      on: { START: { target: 'working', actions: 'resetTimer' } }
    },
    working: {
      after: { 
        25000: { target: 'resting', actions: ['playSound', 'vibrate'] }
      },
      on: {
        PAUSE: 'paused',
        STOP: 'idle'
      }
    },
    paused: {
      on: {
        RESUME: 'working',
        STOP: 'idle'
      }
    },
    resting: {
      after: {
        5000: { target: 'working', actions: ['playSound', 'vibrate'] }
      },
      on: {
        PAUSE: 'paused',
        STOP: 'idle'
      }
    }
  }
});
```

**UI Integration (Preact):**
```jsx
import { signal } from '@preact/signals';
import { useMachine } from '@xstate/preact';

export function SessionTimer() {
  const [state, send] = useMachine(sessionMachine);
  const timeLeft = signal(1500); // 25 min en segundos

  const handlePlay = () => send('START');
  const handlePause = () => send('PAUSE');
  const handleStop = () => send('STOP');

  // Timer effect
  useEffect(() => {
    if (state.matches('working') || state.matches('resting')) {
      const interval = setInterval(() => {
        timeLeft.value = Math.max(0, timeLeft.value - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state]);

  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;

  return (
    <div class="text-center">
      <time class="text-8xl font-mono">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </time>
      {/* Renders here */}
    </div>
  );
}
```

**Flujo Pomodoro por defecto (BUSY mode):**
```
Trabajo 25min → Descanso 5min → Trabajo 25min → Descanso 5min → 
Trabajo 25min → Descanso 5min → Trabajo 25min → Descanso LARGO 15min
```

**Gestos + Controles:**
- **Tap Play:** inicia sesión
- **Tap Pause:** pausa (mantiene tiempo)
- **Swipe up:** +1 min a fase actual
- **Swipe down:** -1 min a fase actual
- **Double tap:** play/pause toggle
- **Long-press:** abre menu rápido (tema, volumen)
- **Tap Stop:** modal confirma "¿Descartar sesión?"

**Persistencia local (SQLite vía Capacitor):**
```typescript
// sessionService.ts
import { CapacitorSQLite } from '@capacitor-community/sqlite';

export async function saveSesion(session: Session) {
  const db = await CapacitorSQLite.openOrCreateDatabase({
    database: 'busy.db'
  });
  await db.run(
    `INSERT INTO sessions (start_time, end_time, duration, mode, cycles_completed)
     VALUES (?, ?, ?, ?, ?)`,
    [session.startTime, session.endTime, session.duration, session.mode, session.cycles]
  );
}

export async function getStreak(): Promise<number> {
  // Query sesiones de últimos 7 días
  // return días consecutivos con ≥1 sesión
}
```

---

### 2. Render de Estado & Widgets
**Pantalla principal (SessionView.jsx):**
- Fase actual + tiempo restante (monospaced Geist Mono)
- Ciclo actual / total (ej. "Ciclo 2 de 4")
- Progress bar circular (trazo blanco sobre fondo gris oscuro)
- Mensaje personalizado en CUSTOM mode (tipografía Body, escalable)
- Nothing DS: sin colores, únicamente escala de grays + transparencias

```jsx
export function SessionView() {
  return (
    <ion-content class="!bg-black">
      {/* Header con fase */}
      <header class="px-6 pt-8 pb-4">
        <p class="text-gray-500 text-sm font-mono uppercase">{phaseName}</p>
      </header>

      {/* Timer grande */}
      <div class="flex justify-center my-16">
        <time class="text-9xl font-mono font-bold text-white">
          {minutes}:{seconds}
        </time>
      </div>

      {/* Progress circular */}
      <div class="flex justify-center mb-12">
        <ProgressRing 
          percent={progressPercent}
          size={160}
          strokeWidth={3}
          strokeColor="#ffffff"
          trailColor="#3F3F3F"
        />
      </div>

      {/* Ciclo */}
      <p class="text-center text-gray-400 text-xs font-mono">
        Ciclo {currentCycle} de {totalCycles}
      </p>
    </ion-content>
  );
}
```

**Widget de pantalla de inicio (iOS/Android):**
- **iOS (App Intents):** Widget de Lock Screen + Home Screen
  - 16×16 lock screen time display
  - Medium home screen (timer en tiempo real)
  - Tap Play/Pause directo desde lock screen
- **Android (App Widgets):** Widget simple 2×2 en home
  - Timer sync vía App Widget API
  - Intent broadcasts: PLAY, PAUSE, STOP

```kotlin
// Android: MySessionWidget.kt
class MySessionWidget : GlanceAppWidget() {
  override suspend fun provideContent() = GlanceContent {
    val time = sessionState.time.collectAsState(initial = "25:00")
    Column(modifier = GlanceModifier.fillMaxSize().background(Color.Black)) {
      Text(time.value, style = TextStyle(fontSize = 24.sp, fontFamily = GoogleFont(Family.JetBrainsMono)))
      Row {
        Button("PLAY") { /* sendIntent(PLAY) */ }
        Button("PAUSE") { /* sendIntent(PAUSE) */ }
      }
    }
  }
}
```

**Local Notifications (Capacitor):**
```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

export async function schedulePhaseNotification(phaseName: string, durationMs: number) {
  await LocalNotifications.schedule({
    notifications: [{
      id: Date.now(),
      title: 'Fase completada',
      body: `Siguiente: ${phaseName}`,
      smallIcon: 'ic_notification', // Nothing-styled icon
      sound: 'notification.wav',
      largeBody: true
    }],
    notifications[0].schedule = { 
      at: new Date(Date.now() + durationMs) 
    }
  });
}
```

---

### 3. Activación Automática (Background Detection)

#### Detect en foreground (Capacitor + MediaDevices API):
```typescript
// services/detectionService.ts
export async function detectMicrophoneActive(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const sum = dataArray.reduce((a, b) => a + b);
    const avg = sum / dataArray.length;
    
    stream.getTracks().forEach(track => track.stop());
    
    // Si hay ruido >threshold → en llamada
    return avg > 30;
  } catch (err) {
    console.error('Mic detection error', err);
    return false;
  }
}

// Background: usar Capacitor Background Task
import { BackgroundTask } from '@capacitor/background-task';

export function startBackgroundDetection() {
  BackgroundTask.beforeExit(async () => {
    const isInCall = await detectMicrophoneActive();
    if (isInCall && !sessionRunning) {
      // Auto-start CUSTOM "EN LLAMADA"
      dispatch({ type: 'AUTO_START_CALL' });
    }
    BackgroundTask.finish();
  });
}
```

#### Calendario (iOS + Android):
```typescript
// Requiere permiso READ_CALENDAR
import { Calendar } from '@ionic-native/calendar/ngx';

export async function getNextMeeting(): Promise<CalendarEvent | null> {
  try {
    const events = await Calendar.listCalendars();
    const now = Date.now();
    return events
      .filter(e => e.startTime > now)
      .sort((a, b) => a.startTime - b.startTime)[0] || null;
  } catch (err) {
    return null;
  }
}

// En SettingsView: toggle "Auto-start antes de reunión" → 5 min antes
```

#### Cross-device Sync (Firebase Realtime o WebSocket):
```typescript
// services/syncService.ts
export function syncSessionAcrossDevices(sessionId: string) {
  const docRef = doc(db, 'sessions', sessionId);
  
  // Broadcast a otros devices
  onSnapshot(docRef, (snap) => {
    if (snap.data().deviceId !== currentDeviceId) {
      // Mostrar notificación en otro device
      LocalNotifications.schedule({
        notifications: [{
          title: 'Sesión en otro device',
          body: `${snap.data().mode} iniciada en tablet`
        }]
      });
    }
  });
}
```

---

### 4. Bloqueo de Distracciones & Focus Mode

**En tablet (Capacitor + Native APIs):**
```typescript
// services/focusService.ts
export async function activateFocusMode(sessionDuration: number) {
  // iOS: usar Focus API (iOS 16.1+)
  if (isPlatform('ios')) {
    // Requiere HomeKit permisos
    await HomeKit.activateFocus('BUSY Focus', sessionDuration);
  }
  
  // Android: Do Not Disturb (API 31+)
  if (isPlatform('android')) {
    const hasPermission = await NotificationManager.checkDndPermission();
    if (hasPermission) {
      await NotificationManager.setDndMode('priority_only', sessionDuration);
    }
  }

  // Pausar Spotify/Apple Music si está en background
  // (requiere plugin custom o delegación a OS controls)
  await pauseBackgroundAudio();
}

export async function pauseBackgroundAudio() {
  // iOS: Media.playback() / pause()
  // Android: MEDIA_BUTTON intent
}
```

**Toggle en SettingsView:**
```jsx
<ion-list class="!bg-transparent">
  <ion-item class="!--background: transparent !border-b !border-gray-800">
    <ion-label class="!text-white">Do Not Disturb</ion-label>
    <ion-toggle
      slot="end"
      checked={dndEnabled}
      onIonChange={handleDndToggle}
      class="!--background: #3F3F3F"
    />
  </ion-item>
  
  <ion-item>
    <ion-label class="!text-white">Pausar música</ion-label>
    <ion-toggle slot="end" checked={pauseMusic} />
  </ion-item>
</ion-list>
```

---

### 5. Smart Home & Automaciones

#### Matter (HomeKit / Google Home):
```typescript
// services/matterService.ts (Future: cuando Capacitor tenga Matter plugin)
export async function exposeToMatter() {
  // Registrar BUSY como "Smart Control" (Matter device type)
  // Propiedades: OnOff (sesión activa/inactiva), time (timer)
  // Trigger: "Cuando BUSY inicia sesión" → automaciones en HomeKit
}
```

#### Home Assistant Webhook:
```typescript
// services/haService.ts
const HA_WEBHOOK = 'https://your-ha-instance.local/api/webhook/busy-bar';

export async function notifyHomeAssistant(event: 'session_started' | 'session_ended') {
  try {
    await fetch(HA_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        duration: currentSession?.duration || null
      })
    });
  } catch (err) {
    console.warn('HA webhook failed (offline OK)', err);
  }
}

// En SessionViewModel:
useEffect(() => {
  if (state.matches('working')) {
    notifyHomeAssistant('session_started');
  } else if (state.matches('completed')) {
    notifyHomeAssistant('session_ended');
  }
}, [state]);
```

---

### 6. Sincronización Multi-Dispositivo & Cloud Sync

**BUSY Account (Firebase):**
```typescript
// services/authService.ts
import { getAuth, signInWithEmail, createUserWithEmailAndPassword } from '@firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from '@firebase/firestore';

export async function loginBUSY(email: string, password: string) {
  const auth = getAuth();
  const user = await signInWithEmailAndPassword(auth, email, password);
  
  // Fetch user config
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  return { user, config: userDoc.data() };
}

export async function saveSesionToCloud(session: Session) {
  const db = getFirestore();
  const user = getAuth().currentUser;
  
  if (!user) return; // offline OK
  
  await setDoc(
    doc(db, 'users', user.uid, 'sessions', session.id),
    {
      ...session,
      syncedAt: serverTimestamp()
    }
  );
}
```

**Realtime sync (Preact Signals + Firestore Listener):**
```typescript
// viewmodels/sessionViewModel.ts
import { signal } from '@preact/signals';
import { onSnapshot, query, where } from '@firebase/firestore';

export const cloudSessions = signal<Session[]>([]);

export function subscribeToSessions(userId: string) {
  const db = getFirestore();
  const q = query(collection(db, 'users', userId, 'sessions'));
  
  return onSnapshot(q, (snap) => {
    cloudSessions.value = snap.docs.map(d => d.data() as Session);
  });
}

// En StatsView:
<div class="text-white">
  <p>Sesiones hoy: {cloudSessions.value.filter(s => isToday(s.startTime)).length}</p>
  <p>Racha: {calculateStreak(cloudSessions.value)} días</p>
</div>
```

**Offline-first (Watermelon DB para sync local):**
```typescript
// setupDatabase.ts
import { database } from '@nozbe/watermelon';
import SQLiteAdapter from '@nozbe/watermelon/adapters/sqlite';

const adapter = new SQLiteAdapter({
  dbName: 'BUSYBar',
  schema: appSchema,
  synchronous: false
});

export const db = new Database({
  adapter,
  modelClasses: [SessionModel, ConfigModel],
  actionsEnabled: true
});

// Sync: cuando vuelve online, push local changes + pull remote
```

---

## API Backend & Conectividad

### Endpoints esperados (Backend propio + Firebase):
```http
POST   /auth/login              → token JWT + refresh_token
POST   /auth/register           → crear cuenta
POST   /sessions                → crear sesión
PATCH  /sessions/{id}           → actualizar (pause, resume, stop)
GET    /sessions                → histórico
GET    /stats                   → racha, totales
POST   /automations/webhook     → Home Assistant webhook endpoint
WS     /sync                    → WebSocket para realtime updates
```

### Libs HTTP/Sync (Preact):
- **HTTP:** Axios o Fetch nativo (Capacitor maneja HTTPS/proxies)
- **Firebase:** `@firebase/app`, `@firebase/auth`, `@firebase/firestore`
- **WebSocket:** Preact + native WebSocket API
- **State:** Preact Signals + optional XState (máquinas de estado)
- **Offline:** Watermelon DB (local-first) o PouchDB

### CORS & Network
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.busybar.app',
  appName: 'BUSY Bar',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true, // usa native HTTP en lugar de fetch
    }
  }
};
```

---

## Arquitectura Monorepo (pnpm)

```
busy-bar/
├── pnpm-workspace.yaml
├── package.json
│   "name": "@busy-bar/workspace",
│   "type": "module",
│   "private": true,
│   "devDependencies": {
│     "vite": "^5.0.0",
│     "typescript": "^5.3.0",
│     "tailwindcss": "^3.4.0",
│     "pnpm": "^9.0.0"
│   }
├── turbo.json (opcional: build orchestration)
│
├── packages/
│   │
│   ├── shared/
│   │   ├── package.json (name: "@busy-bar/shared")
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── session.ts
│   │   │   │   ├── mode.ts
│   │   │   │   └── user.ts
│   │   │   ├── api/
│   │   │   │   ├── client.ts (Axios instance)
│   │   │   │   ├── sessions.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── automations.ts
│   │   │   ├── utils/
│   │   │   │   ├── time.ts (format timers)
│   │   │   │   ├── storage.ts (Capacitor + IndexedDB)
│   │   │   │   └── validators.ts
│   │   │   └── constants/
│   │   │       ├── config.ts
│   │   │       └── defaults.ts
│   │   └── tsconfig.json
│   │
│   ├── design-tokens/
│   │   ├── package.json (name: "@busy-bar/design-tokens")
│   │   ├── tailwind.config.ts
│   │   │   export default {
│   │   │     theme: {
│   │   │       colors: {
│   │   │         black: '#000000',
│   │   │         'black-oled': '#0A0A0A',
│   │   │         white: '#FFFFFF',
│   │   │         gray: { 50: '#F5F5F5', 100: '#E8E8E8', ..., 900: '#0A0A0A' }
│   │   │       },
│   │   │       fontFamily: {
│   │   │         sans: 'GeistSans, sans-serif',
│   │   │         mono: 'GeistMono, monospace',
│   │   │       },
│   │   │       borderRadius: { md: '0.375rem', lg: '0.5rem' }
│   │   │     },
│   │   │     plugins: [require('@tailwindcss/forms')]
│   │   │   }
│   │   ├── styles/
│   │   │   ├── globals.css (reset + variables CSS)
│   │   │   └── nothing.css (custom classes Nothing style)
│   │   └── index.ts (export config)
│   │
│   ├── web/
│   │   ├── package.json (name: "@busy-bar/web")
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── app.tsx (root Preact component)
│   │   │   ├── main.tsx (entry point)
│   │   │   ├── routes/
│   │   │   │   ├── index.tsx (home)
│   │   │   │   ├── session.tsx
│   │   │   │   ├── stats.tsx
│   │   │   │   └── settings.tsx
│   │   │   ├── components/
│   │   │   │   ├── SessionTimer.tsx
│   │   │   │   ├── ProgressRing.tsx
│   │   │   │   ├── ModeSelector.tsx
│   │   │   │   ├── ControlBar.tsx
│   │   │   │   └── StatsCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSession.ts
│   │   │   │   ├── useNotifications.ts
│   │   │   │   └── useSync.ts
│   │   │   ├── styles/
│   │   │   │   └── index.css
│   │   │   └── vite-env.d.ts
│   │   ├── vite.config.ts (Preact plugin + PWA)
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── mobile/
│       ├── package.json (name: "@busy-bar/mobile")
│       ├── ionic.config.json
│       │   {
│       │     "name": "BUSY Bar",
│       │     "integrations": { "capacitor": {} },
│       │     "type": "react", (although we're using Preact)
│       │     "projects": { "app": { "root": "src", "platforms": ["ios", "android"] } }
│       │   }
│       ├── capacitor.config.ts
│       ├── src/
│       │   ├── app.tsx (Preact app root)
│       │   ├── main.tsx (entry with IonApp)
│       │   ├── pages/
│       │   │   ├── SessionPage.tsx (fullscreen timer)
│       │   │   ├── StatsPage.tsx
│       │   │   └── SettingsPage.tsx
│       │   ├── components/ (iOS/Android optimized)
│       │   │   ├── SessionTimer.tsx
│       │   │   ├── IonControlBar.tsx
│       │   │   └── ModeSegment.tsx
│       │   ├── hooks/
│       │   │   ├── useCapacitor.ts (permisos, sensores)
│       │   │   ├── useSession.ts
│       │   │   └── useNotifications.ts
│       │   ├── services/
│       │   │   ├── capacitor.ts (permisos, haptic)
│       │   │   ├── audio.ts
│       │   │   ├── background.ts
│       │   │   └── sync.ts
│       │   ├── styles/
│       │   │   └── index.css (Ionic overrides Nothing DS)
│       │   └── vite-env.d.ts
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── ios/ (XCode project, auto-generated)
│       ├── android/ (Gradle project, auto-generated)
│       └── .env.example
│
├── tests/
│   ├── unit/
│   │   ├── sessionMachine.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   └── sync.test.ts
│   └── e2e/
│       └── session.spec.ts (Playwright)
│
├── docs/
│   ├── SETUP.md (dev environment)
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
└── scripts/
    ├── build.sh (all packages)
    ├── build-ios.sh
    └── build-android.sh
```

### pnpm scripts (root package.json):
```json
{
  "scripts": {
    "dev:web": "pnpm -C packages/web run dev",
    "dev:mobile": "pnpm -C packages/mobile run dev",
    "build:all": "pnpm -r build",
    "build:ios": "pnpm -C packages/mobile run build:ios",
    "build:android": "pnpm -C packages/mobile run build:android",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  }
}
```

### Package.json de mobile example:
```json
{
  "name": "@busy-bar/mobile",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build && cap sync",
    "build:ios": "npm run build && cap open ios",
    "build:android": "npm run build && cap open android",
    "preview": "vite preview"
  },
  "dependencies": {
    "preact": "^10.17.0",
    "preact-router": "^4.1.0",
    "@preact/signals": "^1.2.0",
    "@ionic/core": "^8.0.0",
    "@ionic/react": "^8.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/local-notifications": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "firebase": "^10.0.0",
    "@xstate/preact": "^3.0.0",
    "xstate": "^4.38.0",
    "@busy-bar/shared": "workspace:*",
    "@busy-bar/design-tokens": "workspace:*"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "@ionic/cli": "latest"
  }
}
```

---

## Especificaciones Técnicas

### Performance (Preact + Vite)
- **Timer accuracy:** ±100ms (requestAnimationFrame)
- **FCP (First Contentful Paint):** <2s en tablet (WiFi)
- **Render:** 60 FPS (Preact Signals optimización automática)
- **Memory (tablet):** <80 MB en reposo, <150 MB con sesión activa
- **Battery:** <3% consumo/hora en screen-on (Vite production build + screen-off)
- **Bundle size:** <150 KB (Preact + Ionic, gzipped)
- **Storage:** ~10 MB para 6 meses de sesiones (SQLite)

### Desarrollo Local
```bash
# Setup inicial
pnpm install
pnpm run build:all

# Development (hot reload)
pnpm run dev:web      # localhost:5173
pnpm run dev:mobile   # same, pero con Capacitor listening

# Testing
pnpm run test         # todas las suites
pnpm run test:watch   # modo watch

# Build nativo
pnpm run build:ios    # abre Xcode
pnpm run build:android # abre Android Studio
```

### Persistencia (Local)
- **iOS:** SQLite vía CapacitorSQLite o Realm
- **Android:** idem
- **Web:** IndexedDB (via Watermelon DB abstraction)
- **Schema:**
  ```sql
  sessions (id, start_time, end_time, duration, mode, cycles_completed, synced_at)
  modes (id, user_id, name, duration_work, duration_rest, emoji, custom_text)
  user_config (user_id, dnd_enabled, pause_music, theme, locale)
  ```

### Backups & Export
- **iCloud:** Capacitor iCloud plugin (opcional, en Settings)
- **Google Drive:** Drive integration (Android OAuth)
- **Manual:** export JSON desde Settings → file share

### Testing
- **Unit:** Vitest (state machine, utils, time formatting)
  ```bash
  pnpm run test:unit
  ```
- **Integration:** Playwright (web), TestCafé (mobile simulator)
- **E2E:** Playwright cross-browser (web on iPad layout)
- **Cases borde:**
  - App en background → timer sigue (con `useVisibilityState` hook)
  - Batería < 20% → UI aviso, reduce refresh rate
  - Timezone change → recompute session dates
  - Network loss → local queue, retry on reconnect
  - Device lock durante sesión → timer no se pausa
  - Capacitor plugin fail → fallback graceful (ej. no haptic → solo sonido)

---

## Flujos de Usuario Clave

### Flujo 1: Sesión Básica Pomodoro (Offline - MVP)
```
1. User abre app → SessionPage carga (Preact + Vite, <2s)
2. Ve "TRABAJO" + "25:00" en timer grande (monospaced Geist Mono)
3. Progress ring vacío (0%)
4. Tap botón PLAY (white bg-black, Nothing style)
   → estado.matches('working') = true
   → requestAnimationFrame inicia countdown
   → haptic feedback (lightweight)
5. Timer avanza: 24:59 → 24:58 → ...
6. Progress ring se llena suavemente
7. A los 25:00 → estado transitions a 'resting'
   → vibración medium (100ms haptic)
   → sonido notification (whoosh.wav)
   → pausa automática (timer congelado en 5:00)
8. Muestra "DESCANSO" + "5:00"
9. User tap PLAY nuevamente
   → estado.matches('resting') = true
   → cuenta regresiva 5 minutos
10. Repeat: trabajo → descanso → trabajo → descanso (4 ciclos)
11. Después de 4to descanso → "DESCANSO LARGO" (15 min)
12. Al terminar: notificación "¡Completaste sesión!"
    → estado transitions a 'completed'
13. User ve resumen: "120 min, 4 ciclos, racha: 3 días"
    → saveSessionLocal() persiste en SQLite
14. Tap "Nueva sesión" → vuelve a idle
```

### Flujo 2: Auto-Detect + CUSTOM Mode (Background)
```
1. User tiene BUSY abierta en tablet
2. Inicia Zoom call (micrófono activo)
3. BackgroundTask.beforeExit() → detectMicrophoneActive() → true
4. dispatch({ type: 'AUTO_START_CALL' })
   → sessionMachine transitions a 'working' automáticamente
   → pero con modo 'CUSTOM'
5. App muestra "📞 EN LLAMADA" + timer simple (no Pomodoro)
6. Notificación local: "Llamada detectada - sesión iniciada"
   → opcional: notify phone vía cloud ("En llamada en tablet")
7. Micrófono se detiene (call ends)
8. User tap STOP en tablet
   → modal: "¿Terminar sesión?" → sí
   → sessionMachine transition a 'idle'
   → saveSesionLocal() con duración real (ej. 32 minutos)
9. LocalNotifications: "Sesión guardada: 32 min de enfoque"
```

### Flujo 3: Login + Cloud Sync (Firebase)
```
1. User abre app (primera vez) → SettingsPage
2. Tap "Inicia sesión" → LoginModal
3. Email + password → loginBUSY(email, pwd)
   → Firebase auth → JWT token
   → stored en Keychain (iOS) / KeyStore (Android)
4. Fetch user config de Firestore
   → cloudSessions.value (Preact Signal) = []
5. User creates sesiones locales (offline OK)
6. Al estar online:
   → saveSesionToCloud(session) → POST /sessions (JWT auth)
   → Firestore listener subscribeToSessions() → realtime updates
7. StatsPage muestra:
   - Local: "2 sesiones hoy" (no synced yet)
   - Cloud: sync icon animado
   - → completes → cloud count matches
8. Abre phone app (same account)
   → fetchCloudSessions() → ve mismo historial
   → streak sincronizado
9. Inicia sesión en phone
   → WebSocket notificación en tablet: "Sesión en otro device"
```

### Flujo 4: Focus Mode + Smart Home (iOS)
```
1. SettingsPage → toggle "Activar Focus Mode"
2. User inicia sesión
3. dispatch({ type: 'FOCUS_START' })
   → activateFocusMode(1500) → iOS Focus API
   → crear "BUSY Focus" si no existe
   → pauseBackgroundAudio() → Spotify pause
   → Do Not Disturb activado
4. Home Assistant webhook POST /webhook/busy-bar
   {
     "event": "session_started",
     "duration": 1500,
     "timestamp": "2026-10-11T14:30:00Z"
   }
5. HA automation triggers: "Smart lights dim to 20%"
6. Al terminar sesión:
   → Focus Mode se desactiva
   → webhook "session_ended"
   → HA: "lights back to normal"
7. Notificación: "¡Foco completado! Spotify reanudado"
```

---

## Reglas de Desarrollo (Preact + Ionic + Capacitor)

1. **Offline-first:** El timer funciona sin red. Sync local → cloud es eventual. Cuando offline, localStorage + SQLite. Al online, Watermelon DB sincroniza.

2. **Nothing Design System only:** 
   - Monochromatic: black/white/grays, sin colores primarios
   - Tipografía: Geist Sans/Mono únicamente
   - Sin gradientes, sin sombras decorativas
   - Bordes: 4-6px máximo
   - Espaciado: múltiplos de 4px (Tailwind default)

3. **Preact best practices:**
   - Usa Preact Signals para state (observable pattern)
   - Componentes funcionales únicamente
   - Props tipadas con TypeScript
   - Evita re-renders innecesarios: useMemo, useCallback
   - Bundle: code-split por ruta (lazy load vía Preact Router)

4. **Ionic + Capacitor:**
   - Usa componentes `ion-*` para máxima compatibilidad nativa
   - No customices Ionic CSS a menos que rompa Nothing DS (en tal caso, override via Tailwind)
   - Todos los permisos via `@capacitor/permissions` API
   - Plugins: pin a versiones estables (`@capacitor/core@6.0.0`)

5. **Tailwind CSS:**
   - Import global en `src/styles/index.css`
   - Custom tokens en `@busy-bar/design-tokens/tailwind.config.ts`
   - Clases custom: `@apply` solo para componentes reutilizables
   - Responsive: `sm:`, `md:` (tablet first approach)

6. **Validación de entrada:**
   - CUSTOM mode editor: máx 100 caracteres
   - Emojis OK (permite hasta 5)
   - No permite URLs ni código
   - Sanitiza input (DOMPurify si es necesario)

7. **Gestión de batería & performance:**
   - Timer: requestAnimationFrame (60 FPS máximo)
   - UI updates: Preact Signals batch automáticamente
   - Screen wake lock: Capacitor `ScreenBrightness` API
   - Background: usar `BackgroundTask` para tareas cortas, NO timers en background (se pausan en iOS)

8. **Seguridad:**
   - Tokens: Capacitor Preferences (encrypts automáticamente en nativo)
   - No localStorage para secrets (nunca)
   - HTTPS only para API calls
   - CORS: configurado en backend
   - API auth: JWT con refresh token rotation

9. **Graceful degradation:**
   - Sin Capacitor? → fallback a web app (PWA mode)
   - Sin HomeKit? → app funciona igual, feature unavailable
   - Sin permiso micrófono? → toggle desactivado, resto OK
   - Sin internet? → local-first, queue pending actions, retry al volver

10. **Accesibilidad (WCAG 2.1 AA):**
    - Texto: mín. 16px, línea 1.5
    - Contraste: 4.5:1 para body, 3:1 para large text
    - Botones: 44×44px mín. hit area
    - VoiceOver (iOS) + TalkBack (Android) testing
    - Keyboard navigation: Tab, Enter, Escape functional
    - Aria labels en componentes dinámicos

---

## MVP vs. Full Scope

### MVP v1.0 (Lanzamiento - 8-10 semanas)
**Features core, offline, Nothing design**

- ✅ Timer Pomodoro (25/5, 4 ciclos, BUSY mode)
- ✅ CUSTOM mode (mensaje + emoji + timer simple)
- ✅ Play/Pause/Stop con XState
- ✅ Notificaciones locales (fase completada, sesión guardada)
- ✅ Persistencia SQLite local (histórico diario)
- ✅ Dark mode (OLED-first, #0A0A0A)
- ✅ Tablet UI (iPad 7-12", landscape + portrait)
- ✅ Nothing Design System (Geist tipografía, monochrome, Tailwind)
- ✅ Haptic feedback + sonidos (inicio, fin, descanso)
- ✅ Stats básica (sesiones hoy, racha, total horas)
- ✅ Responsive design (testeo manual en tablet real)
- ✅ Build & deploy: iOS + Android (TestFlight + Google Play Beta)

**Excluye:**
- ❌ Cloud sync (guardar solo local)
- ❌ Login / BUSY Account
- ❌ Auto-detect micrófono
- ❌ Widgets nativos
- ❌ HomeKit / Home Assistant
- ❌ Focus Mode automation

### Phase 2 v1.1-1.5 (Semanas 11-16)
**Auth, sync, cross-device**

- 🔜 BUSY Account (Firebase auth)
- 🔜 Cloud sync (Firestore realtime)
- 🔜 Stats avanzadas (gráficos semanales, streaks)
- 🔜 Widgets (iOS Home Screen + Lock Screen, Android home)
- 🔜 Auto-detect micrófono (background detection)
- 🔜 Focus Mode integration (iOS 16+)
- 🔜 Do Not Disturb (iOS/Android)
- 🔜 Home Assistant webhook básica

### Phase 3 (v2.0+)
**Integraciones avanzadas, IA, wearables**

- 🔮 Hardcore mode (bloqueo de apps, Device Admin Android)
- 🔮 Calendar sync (próxima reunión)
- 🔮 IA recomendaciones (descanso, ajuste timers)
- 🔮 Apple Watch / Wear OS companion
- 🔮 Matter + HomeKit full integration
- 🔮 MQTT + Home Assistant avanzado
- 🔮 Exportar datos (CSV, PDF reports)
- 🔮 Colaboración (shared sessions, team stats)

---

## Checklist de Entrega por Feature

**Para cada feature MVP entrega:**

### Design & UX
- [ ] Figma: wireframe + mockup (Nothing DS colors/typo)
- [ ] Responsive testing: iPad 7" + 12" (landscape & portrait)
- [ ] Dark mode: #0A0A0A + grays validados
- [ ] Geist fonts: descargadas de Google Fonts, preloaded

### Development
- [ ] TypeScript: tipado fuerte, sin `any`
- [ ] Componentes Preact: funcional, props typed
- [ ] Ionic: `ion-*` tags para compatibilidad nativa
- [ ] Tailwind: clases aplicadas, sin inline styles
- [ ] pnpm workspace: imports de `@busy-bar/*` resueltos

### State & Logic
- [ ] XState machine: todos los estados testeados
- [ ] Preact Signals: reactividad sin re-renders innecesarios
- [ ] localStorage/SQLite: reads & writes correctas
- [ ] Capacitor plugins: permisos solicitados, errores handled

### Testing
- [ ] Unit tests: ≥80% coverage (state machine, utils)
  ```bash
  pnpm run test -- --coverage
  ```
- [ ] UI tests: Preact Testing Library (components)
  ```jsx
  render(<SessionTimer initialTime={25 * 60} />);
  // assertions
  ```
- [ ] E2E tests: Playwright (web on iPad viewport)
  ```bash
  npx playwright test --headed
  ```
- [ ] Manual: device real iPad (iOS) + Android tablet

### Edge Cases
- [ ] **Batería baja:** UI aviso < 20%, reduce updates
- [ ] **Sin red:** local queue, retry en reconnect
- [ ] **Timezone change:** sesiones no se rompen
- [ ] **Lock screen:** timer continúa si background permitido
- [ ] **App paused/resumed:** state no se corrompe
- [ ] **Capacitor plugin unavailable:** fallback graceful
- [ ] **Large text (A11y):** layout no se rompe

### Accessibility
- [ ] WCAG 2.1 AA: contrast ratio ≥4.5:1
- [ ] Hit areas: ≥44×44px
- [ ] Keyboard nav: Tab, Enter, Escape funcionales
- [ ] Screen reader: VoiceOver (iOS) & TalkBack (Android) testeado
- [ ] Aria labels: en elementos dinámicos

### Performance
- [ ] Bundle size: <150 KB gzipped
- [ ] FCP: <2s en tablet WiFi
- [ ] Memory: <80 MB en reposo
- [ ] Battery: <3% consumo/hora
  ```bash
  # macOS
  xcode-select --install
  # luego run profiler en Xcode
  ```

### Deployment
- [ ] Build iOS: `pnpm run build:ios` → TestFlight ready
- [ ] Build Android: `pnpm run build:android` → Play Store beta ready
- [ ] Version bumped (major.minor.patch)
- [ ] Release notes: changelog.md actualizado
- [ ] Firebase/backend: staging env testeado

### Documentation
- [ ] Code comments: functions & complex logic
- [ ] TypeScript: docstrings (JSDoc)
- [ ] README.md: setup + development guide
- [ ] Architecture.md: diagrams si aplica
- [ ] API docs: si usa endpoints custom

### Code Review
- [ ] PR description: context + changes
- [ ] Linting: `pnpm run lint` ✅ (ESLint + Prettier)
- [ ] No console.logs en prod
- [ ] No hard-coded secrets
- [ ] Git history: squash/rebase si necesario

---

## Preguntas Clarificadoras (Si Falta Info)

Antes de empezar, clarificar:

- **Backend:** ¿Firebase + Firestore o servidor propio? ¿URL?
- **Timing:** ¿MVP solo web? ¿iOS + Android simultáneamente?
- **Permisos:** ¿Usar todos los Capacitor plugins o subset?
- **Smart Home:** ¿Home Assistant en MVP o Phase 2?
- **Foldables:** ¿Support Android foldables (tablet fijo, no foldables)?
- **Companion:** ¿Apple Watch / Wear OS en roadmap?
- **Analytics:** ¿Mixpanel / PostHog para telemetría?
- **CI/CD:** ¿GitHub Actions, GitLab CI, o Jenkins?
- **App Store:** ¿Socios de distribución (terceros) o directo?
- **Privacidad:** ¿GDPR, CCPA compliance?

---

## Links Útiles

- **Preact docs:** https://preactjs.com
- **Ionic docs:** https://ionicframework.com/docs
- **Capacitor docs:** https://capacitorjs.com
- **Tailwind CSS:** https://tailwindcss.com
- **XState:** https://stately.ai/viz (state machine debugger)
- **Nothing design:** https://nothing.tech (inspiración)
- **Google Fonts - Geist:** https://fonts.google.com/specimen/Geist

---

## Estructura de Commits Sugerida

```
feat: add SessionTimer component
fix: timer not pausing on background
refactor: extract NotificationService
test: add SessionMachine tests
docs: update README with setup instructions
style: apply Nothing design to buttons
perf: optimize Preact Signal updates
```

Usa [Conventional Commits](https://www.conventionalcommits.org).

---

## Estructura de PR

```markdown
## Description
Brief explanation of changes.

## Related Issue
Closes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Testing
- [ ] Unit tests added
- [ ] Manual testing on device
- [ ] Accessibility checked

## Screenshots (si aplica)
![timer-screenshot]

## Checklist
- [ ] Code follows style guidelines
- [ ] No new warnings generated
- [ ] Tests pass locally
```
