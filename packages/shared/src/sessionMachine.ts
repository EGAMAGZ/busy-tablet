import { assign, createMachine } from 'xstate';
import type { Phase } from './types/session';

export type SessionEvent =
  | { type: 'START' }
  | { type: 'PAUSE'; remainingMs: number }
  | { type: 'RESUME' }
  | { type: 'COMPLETE' }
  | { type: 'STOP' }
  | { type: 'RESET' };

export interface SessionContext {
  phase: Phase;
  cycle: number;
  cycles: number;
  resumeTo: 'working' | 'resting' | 'longRest';
  remainingMs: number;
}

export const SessionEffects = {
  playSound: 'playSound' as const,
  vibrate: 'vibrate' as const,
  notifyStart: 'notifyStart' as const,
  notifyPhase: 'notifyPhase' as const,
  notifyDone: 'notifyDone' as const,
  notifyStop: 'notifyStop' as const,
};

const FADE_IN = [SessionEffects.playSound, SessionEffects.vibrate, SessionEffects.notifyPhase];
const DONE = [SessionEffects.playSound, SessionEffects.vibrate, SessionEffects.notifyDone];

type GuardArgs = { context: SessionContext };

const workDone = [
  {
    guard: ({ context }: GuardArgs) => context.cycle < context.cycles,
    target: 'resting',
    actions: ['restPhase', ...FADE_IN],
  },
  {
    target: 'longRest',
    actions: ['longRestPhase', ...FADE_IN],
  },
];

// Shared transitions for "a paused phase ran its tail out after resume".
const resumeDone = [
  {
    guard: ({ context }: GuardArgs) => context.resumeTo === 'working' && context.cycle < context.cycles,
    target: 'resting',
    actions: ['restPhase', ...FADE_IN],
  },
  {
    guard: ({ context }: GuardArgs) => context.resumeTo === 'working',
    target: 'longRest',
    actions: ['longRestPhase', ...FADE_IN],
  },
  {
    guard: ({ context }: GuardArgs) => context.resumeTo === 'resting',
    target: 'working',
    actions: ['restartCycle', ...FADE_IN],
  },
  {
    target: 'completed',
    actions: DONE,
  },
];

const PAUSE_TO = (action: string) => ({ target: 'paused' as const, actions: [action] });

export const sessionMachine = createMachine({
  id: 'session',
  types: {} as {
    context: SessionContext;
    events: SessionEvent;
    input: { cycles: number };
  },
  context: ({ input }) => ({
    phase: 'work' as Phase,
    cycle: 1,
    cycles: input.cycles,
    resumeTo: 'working' as const,
    remainingMs: 0,
  }),
  initial: 'idle',
  states: {
    idle: {
      on: { START: { target: 'working', actions: SessionEffects.notifyStart } },
    },
    working: {
      entry: 'workPhase',
      after: { workDelay: workDone },
      on: {
        COMPLETE: workDone,
        PAUSE: PAUSE_TO('pauseWork'),
        STOP: { target: 'idle', actions: SessionEffects.notifyStop },
      },
    },
    resting: {
      after: { restDelay: { target: 'working', actions: ['restartCycle', ...FADE_IN] } },
      on: {
        COMPLETE: { target: 'working', actions: ['restartCycle', ...FADE_IN] },
        PAUSE: PAUSE_TO('pauseRest'),
        STOP: { target: 'idle', actions: SessionEffects.notifyStop },
      },
    },
    longRest: {
      after: {
        longRestDelay: { target: 'completed', actions: DONE },
      },
      on: {
        COMPLETE: { target: 'completed', actions: DONE },
        PAUSE: PAUSE_TO('pauseLongRest'),
        STOP: { target: 'idle', actions: SessionEffects.notifyStop },
      },
    },
    paused: {
      on: {
        // Always re-enter a countdown state: the tail gets consumed in `resuming`.
        RESUME: { target: 'resuming' },
        STOP: { target: 'idle', actions: SessionEffects.notifyStop },
      },
    },
    resuming: {
      after: { resumeDelay: resumeDone },
      on: {
        COMPLETE: resumeDone,
        STOP: { target: 'idle', actions: SessionEffects.notifyStop },
      },
    },
    completed: {
      on: { RESET: { target: 'idle' } },
    },
  },
}, {
  actions: {
    restartCycle: assign({ cycle: ({ context }) => context.cycle + 1, phase: () => 'work' as const }),
    workPhase: assign({ phase: () => 'work' as const }),
    restPhase: assign({ phase: () => 'rest' as const }),
    longRestPhase: assign({ phase: () => 'longRest' as const }),
    pauseWork: assign({
      resumeTo: () => 'working' as const,
      remainingMs: ({ event }) => (event.type === 'PAUSE' ? event.remainingMs : 0),
    }),
    pauseRest: assign({
      resumeTo: () => 'resting' as const,
      remainingMs: ({ event }) => (event.type === 'PAUSE' ? event.remainingMs : 0),
    }),
    pauseLongRest: assign({
      resumeTo: () => 'longRest' as const,
      remainingMs: ({ event }) => (event.type === 'PAUSE' ? event.remainingMs : 0),
    }),
  },
});