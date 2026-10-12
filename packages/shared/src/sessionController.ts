import { createActor } from 'xstate';
import { sessionMachine } from './sessionMachine';
import { addSession, saveConfig } from './utils/storage';
import { PHASE_LABEL } from './constants/defaults';
import type { SessionConfig, SessionRecord } from './types/session';

export interface SessionEffectHandlers {
  playSound: () => void;
  vibrate: () => void;
  notifyStart: () => void;
  notifyPhase: () => void;
  notifyDone: () => void;
  notifyStop: () => void;
}

export type SessionState = 'idle' | 'working' | 'resting' | 'longRest' | 'paused' | 'resuming' | 'completed';

export interface SessionSnapshot {
  state: SessionState;
  phaseLabel: string;
  cycle: number;
  cycles: number;
  remaining: number;
  total: number;
  progress: number;
  isTimed: boolean;
  paused: boolean;
  completed: boolean;
  displayTime: string;
}

export interface SessionController {
  snapshot: () => SessionSnapshot;
  subscribe: (fn: (snapshot: SessionSnapshot) => void) => () => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  stop: () => void;
  reset: () => void;
  skip: () => void;
  adjustSeconds: (delta: number) => void;
  dispose: () => void;
}

const TICK_MS = 250;

const delayFor = (state: SessionState, durations: SessionConfig, remainingMs: number): number => {
  switch (state) {
    case 'working':
      return durations.work * 1000;
    case 'resting':
      return durations.rest * 1000;
    case 'longRest':
      return durations.longRest * 1000;
    case 'resuming':
      return remainingMs;
    default:
      return 0;
  }
};

const pad = (s: number) => String(s).padStart(2, '0');
const isTimedState = (s: string) => s === 'working' || s === 'resting' || s === 'longRest' || s === 'resuming';

export function createSessionController(config: SessionConfig, effects: SessionEffectHandlers): SessionController {
  const durations = { ...config };
  const listeners = new Set<(snapshot: SessionSnapshot) => void>();
  let snapshot: SessionSnapshot;
  let phaseStart: { at: number; delayMs: number } | null = null;
  let startedAt: number | null = null;
  const maxRemaining = Math.max(durations.work, durations.rest, durations.longRest);

  const actor = createActor(
    sessionMachine.provide({
      delays: {
        workDelay: durations.work * 1000,
        restDelay: durations.rest * 1000,
        longRestDelay: durations.longRest * 1000,
        resumeDelay: ({ context }) => context.remainingMs || maxRemaining * 1000,
      },
      actions: {
        playSound: () => effects.playSound(),
        vibrate: () => effects.vibrate(),
        notifyStart: () => {
          startedAt = Date.now();
          effects.notifyStart();
        },
        notifyPhase: () => effects.notifyPhase(),
        notifyDone: () => {
          const total = durations.work * durations.cycles + durations.rest * (durations.cycles - 1) + durations.longRest;
          const session: SessionRecord = {
            id: crypto.randomUUID(),
            startedAt: startedAt ?? Date.now() - total * 1000,
            endedAt: Date.now(),
            duration: total,
            mode: 'busy',
            cycles: durations.cycles,
          };
          addSession(session);
          effects.notifyDone();
        },
        notifyStop: () => {
          startedAt = null;
          effects.notifyStop();
        },
      },
    }),
    { input: { cycles: durations.cycles } },
  );

  // Re-baseline the countdown whenever the active node changes (allows
  // throttle-safe resuming of the paused tail).
  actor.subscribe((next) => {
    const state = next.value as SessionState;
    if (isTimedState(state)) {
      phaseStart = { at: Date.now(), delayMs: delayFor(state, durations, next.context.remainingMs) };
    } else {
      phaseStart = null;
    }
    emit();
  });

  const derive = (): SessionSnapshot => {
    const state = actor.getSnapshot().value as SessionState;
    const context = actor.getSnapshot().context;
    const timed = isTimedState(state);

    let remaining: number;
    if (state === 'paused') remaining = context.remainingMs / 1000;
    else if (timed && phaseStart) remaining = Math.max(0, (phaseStart.delayMs - (Date.now() - phaseStart.at)) / 1000);
    else if (state === 'idle') remaining = durations.work;
    else remaining = context.remainingMs / 1000;

    const total =
      timed && phaseStart ? phaseStart.delayMs / 1000 : state === 'idle' ? durations.work : Math.max(remaining, context.remainingMs / 1000);
    const progress = total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0;

    let label: string;
    if (state === 'working') label = PHASE_LABEL.work;
    else if (state === 'resting') label = PHASE_LABEL.rest;
    else if (state === 'longRest') label = PHASE_LABEL.longRest;
    else if (context.phase === 'rest') label = PHASE_LABEL.rest;
    else if (context.phase === 'longRest') label = PHASE_LABEL.longRest;
    else label = PHASE_LABEL.work;

    return {
      state,
      phaseLabel: label,
      cycle: context.cycle,
      cycles: context.cycles,
      remaining,
      total,
      progress,
      isTimed: timed,
      paused: state === 'paused',
      completed: state === 'completed',
      displayTime: `${Math.floor(remaining / 60)}:${pad(Math.floor(remaining % 60))}`,
    };
  };

  const emit = () => {
    snapshot = derive();
    listeners.forEach((fn) => fn(snapshot));
  };

  const tick = () => {
    const state = actor.getSnapshot().value as SessionState;
    if (phaseStart && isTimedState(state)) {
      // Backstop for throttled background timers: force the transition on time-out.
      if (Date.now() >= phaseStart.at + phaseStart.delayMs) {
        actor.send({ type: 'COMPLETE' });
        return;
      }
    }
    emit();
  };
  const interval = setInterval(tick, TICK_MS);

  actor.start();
  emit();

  return {
    snapshot: () => snapshot,
    subscribe(fn) {
      listeners.add(fn);
      fn(snapshot);
      return () => listeners.delete(fn);
    },
    start() {
      actor.send({ type: 'START' });
    },
    pause() {
      const s = derive();
      if (!s.isTimed) return;
      actor.send({ type: 'PAUSE', remainingMs: Math.round(s.remaining * 1000) });
    },
    resume() {
      actor.send({ type: 'RESUME' });
    },
    toggle() {
      const state = actor.getSnapshot().value as SessionState;
      if (isTimedState(state)) this.pause();
      else if (state === 'paused') actor.send({ type: 'RESUME' });
      else actor.send({ type: 'START' });
    },
    stop() {
      actor.send({ type: 'STOP' });
    },
    reset() {
      actor.send({ type: 'RESET' });
    },
    skip() {
      if (isTimedState(actor.getSnapshot().value as SessionState)) actor.send({ type: 'COMPLETE' });
    },
    adjustSeconds(delta) {
      const state = actor.getSnapshot().value as SessionState;
      // Before starting, tuning sets the work block length (persisted).
      if (state === 'idle') {
        durations.work = Math.max(60, durations.work + delta);
        saveConfig({ work: durations.work, rest: durations.rest, longRest: durations.longRest, cycles: durations.cycles });
        emit();
        return;
      }
      if (state !== 'working') return;
      const s = derive();
      actor.send({ type: 'PAUSE', remainingMs: Math.max(1000, Math.round((s.remaining + delta) * 1000)) });
      actor.send({ type: 'RESUME' });
    },
    dispose() {
      clearInterval(interval);
      actor.stop();
      listeners.clear();
    },
  };
}