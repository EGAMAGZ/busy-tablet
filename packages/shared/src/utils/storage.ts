import { SESSIONS_KEY, CONFIG_KEY, THEME_KEY } from '../constants/config';
import { DEFAULT_CONFIG } from '../constants/defaults';
import type { SessionConfig, SessionRecord } from '../types/session';
import type { Phase } from '../types/session';

export interface PendingSession extends SessionRecord {
  pending?: boolean;
}

export function loadSessions(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]') as SessionRecord[];
  } catch {
    return [];
  }
}

export function addSession(record: SessionRecord): SessionRecord[] {
  const all = [...loadSessions(), record];
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  return all;
}

export function loadConfig(): SessionConfig {
  try {
    return { ...DEFAULT_CONFIG, ...(JSON.parse(localStorage.getItem(CONFIG_KEY) ?? '{}') as Partial<SessionConfig>) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: SessionConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadTheme(): 'dark' | 'light' {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
}

export function saveTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function dayKey(ts: number): string {
  return new Date(ts).toLocaleDateString('en-CA');
}

export function computeStreak(sessions: SessionRecord[], now = Date.now()): number {
  const days = new Set(sessions.map((s) => dayKey(s.startedAt)));
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(d.getTime()))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export interface Stats {
  todayCount: number;
  todayMinutes: number;
  totalHours: number;
  streak: number;
}

export function computeStats(sessions: SessionRecord[], now = Date.now()): Stats {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const today = sessions.filter((s) => s.startedAt >= start.getTime());
  const totalSeconds = sessions.reduce((a, s) => a + s.duration, 0);
  return {
    todayCount: today.length,
    todayMinutes: Math.round(today.reduce((a, s) => a + s.duration, 0) / 60),
    totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
    streak: computeStreak(sessions, now),
  };
}

export function nextPhaseLabel(phase: Phase): string {
  return phase === 'work' ? 'DESCANSO' : 'TRABAJO';
}