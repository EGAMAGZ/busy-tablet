import { signal } from '@preact/signals';
import { loadTheme, saveTheme } from '@busy-bar/shared';

export const theme = signal<'dark' | 'light'>(loadTheme());

export function setTheme(t: 'dark' | 'light'): void {
  theme.value = t;
  saveTheme(t);
}

const PUBLIC_STATUS_KEY = 'busy.public-status';

export const publicStatus = signal<string | null>(localStorage.getItem(PUBLIC_STATUS_KEY));

export function setPublicStatus(id: string | null): void {
  publicStatus.value = id;
  if (id) localStorage.setItem(PUBLIC_STATUS_KEY, id);
  else localStorage.removeItem(PUBLIC_STATUS_KEY);
}