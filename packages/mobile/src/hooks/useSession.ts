import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  beep,
  createSessionController,
  loadConfig,
  type SessionController,
  type SessionEffectHandlers,
  type SessionSnapshot,
} from '@busy-bar/shared';
import { notify, requestNotifyPermission } from './useNotifications';
import { impact } from '../services/capacitor';

export interface SessionControls extends SessionSnapshot {
  play: () => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  stop: () => void;
  reset: () => void;
  skip: () => void;
  adjustSeconds: (delta: number) => void;
}

function buildEffects(): SessionEffectHandlers {
  return {
    playSound: () => beep(),
    vibrate: () => void impact('light'),
    notifyStart: () => requestNotifyPermission(),
    notifyPhase: () => {
      void impact('medium');
      void notify('Fase completada', 'Siguiente fase en curso');
    },
    notifyDone: () => {
      void impact('heavy');
      void notify('¡Sesión completada!', 'Siguiente sesión lista');
    },
    notifyStop: () => void impact('light'),
  };
}

export function useSession(): SessionControls {
  const controller = useRef<SessionController | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);

  useEffect(() => {
    const c = createSessionController(loadConfig(), buildEffects());
    controller.current = c;
    const unsub = c.subscribe(setSnapshot);
    return () => {
      unsub();
      c.dispose();
      controller.current = null;
    };
  }, []);

  return useMemo<SessionControls>(
    () => ({
      ...(snapshot ?? {
        state: 'idle',
        phaseLabel: 'TRABAJO',
        cycle: 1,
        cycles: (controller.current?.snapshot() ?? loadConfig()).cycles,
        remaining: 0,
        total: 0,
        progress: 0,
        isTimed: false,
        paused: false,
        completed: false,
        displayTime: '25:00',
      }),
      play: () => controller.current?.start(),
      pause: () => controller.current?.pause(),
      resume: () => controller.current?.resume(),
      toggle: () => controller.current?.toggle(),
      stop: () => {
        const s = controller.current?.snapshot();
        if (s && (s.isTimed || s.paused) && !window.confirm('¿Descartar sesión?')) return;
        controller.current?.stop();
      },
      reset: () => controller.current?.reset(),
      skip: () => controller.current?.skip(),
      adjustSeconds: (d) => controller.current?.adjustSeconds(d),
    }),
    [snapshot],
  );
}
