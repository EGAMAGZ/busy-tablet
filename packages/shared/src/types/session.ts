export type Phase = 'work' | 'rest' | 'longRest';

export type SessionMode = 'busy' | 'custom';

export interface SessionConfig {
  work: number;
  rest: number;
  longRest: number;
  cycles: number;
}

export interface SessionRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  duration: number;
  mode: SessionMode;
  cycles: number;
  label?: string;
  emoji?: string;
  deviceId?: string;
  syncedAt?: number;
}