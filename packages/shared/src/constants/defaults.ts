import type { Phase, SessionConfig } from '../types/session';
import type { SessionState } from '../sessionController';

export const DEFAULT_CONFIG: SessionConfig = {
  work: 25 * 60,
  rest: 5 * 60,
  longRest: 15 * 60,
  cycles: 4,
};

export const PHASE_LABEL: Record<Phase, string> = {
  work: 'TRABAJO',
  rest: 'DESCANSO',
  longRest: 'DESCANSO LARGO',
};

// Public status for the "Busy Sign" / cockpit external pane.
export const SIGN_LABEL: Record<SessionState, string> = {
  idle: 'LIBRE',
  working: 'OCUPADO',
  resting: 'DESCANSO',
  longRest: 'DESCANSO',
  paused: 'PAUSA',
  resuming: 'OCUPADO',
  completed: 'LIBRE',
};

export interface PublicStatus {
  id: string;
  label: string;
  glyph: string;
}

// Manual overrides offered by the quick-selection panel. Monochrome glyphs
// only: the Nothing icon pack strips color from every surface.
export const PUBLIC_STATUSES: PublicStatus[] = [
  { id: 'ocupado', label: 'OCUPADO', glyph: '■' },
  { id: 'llamada', label: 'EN LLAMADA', glyph: '◉' },
  { id: 'deep-work', label: 'DEEP WORK', glyph: '◆' },
  { id: 'dnd', label: 'NO MOLESTAR', glyph: '⊘' },
  { id: 'descanso', label: 'DESCANSO', glyph: '○' },
];

export const EMOJIS = ['📞', '🎧', '📚', '✍️', '🧠', '💻', '🎯', '☕', '🔇', '🏃'];