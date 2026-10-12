import { DEFAULT_CONFIG, loadConfig, type SessionConfig } from '@busy-bar/shared';
import { useState } from 'preact/hooks';
import { theme, setTheme } from '../state';
import { useEffect } from 'preact/hooks';

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label class="flex items-center justify-between py-4 border-b border-line">
      <span class="text-sm text-muted uppercase tracking-wide">{label}</span>
      <input
        type="number"
        min="1"
        value={value}
        onInput={(e) => onChange(Math.max(1, Number((e.target as HTMLInputElement).value) || 1))}
        class="w-20 bg-transparent text-right font-display text-xl text-ink focus:outline-none"
      />
    </label>
  );
}

export default function SettingsRoute(_props: { path?: string }) {
  const [config, setConfig] = useState<SessionConfig>(() => loadConfig());
  const update = (fn: (c: SessionConfig) => SessionConfig) => setConfig(() => {
    const next = fn(loadConfig());
    localStorage.setItem('busy.config', JSON.stringify(next));
    return next;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme.value === 'light');
  }, [theme.value]);

  return (
    <div class="w-full max-w-sm">
      <h2 class="text-muted text-sm font-display uppercase tracking-widest mb-6">Ajustes</h2>
      <NumberField label="Trabajo (min)" value={Math.round(config.work / 60)} onChange={(v) => update((c) => ({ ...c, work: v * 60 }))} />
      <NumberField label="Descanso (min)" value={Math.round(config.rest / 60)} onChange={(v) => update((c) => ({ ...c, rest: v * 60 }))} />
      <NumberField label="Descanso largo (min)" value={Math.round(config.longRest / 60)} onChange={(v) => update((c) => ({ ...c, longRest: v * 60 }))} />
      <NumberField label="Ciclos" value={config.cycles} onChange={(v) => update((c) => ({ ...c, cycles: v }))} />
      <button class="mt-6 text-xs uppercase tracking-widest text-muted hover:text-ink" onClick={() => update(() => ({ ...DEFAULT_CONFIG }))}>
        Restaurar valores
      </button>
      <div class="mt-6 flex items-center justify-between py-4 border-t border-line">
        <span class="text-sm text-muted uppercase tracking-wide">Modo claro</span>
        <button
          type="button"
          role="switch"
          aria-label="Modo claro"
          aria-checked={theme.value === 'light'}
          onClick={() => setTheme(theme.value === 'light' ? 'dark' : 'light')}
          class="switch"
        >
          <span class="switch-knob" />
        </button>
      </div>
    </div>
  );
}