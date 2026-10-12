import { signal } from '@preact/signals';
import { useEffect, useState } from 'preact/hooks';
import {
  addSession,
  CUSTOM_EMOJI_KEY,
  CUSTOM_PATTERN_KEY,
  CUSTOM_SIZE_KEY,
  CUSTOM_TEXT_KEY,
  EMOJIS,
  formatTime,
  sanitizeCustomText,
} from '@busy-bar/shared';
import { notify, releaseWakeLock, requestNotifyPermission, acquireWakeLock } from '../hooks/useNotifications';

type Size = 's' | 'm' | 'l';

const read = <T extends string>(key: string, fallback: T): T => (localStorage.getItem(key) as T) ?? fallback;

const customText = signal(localStorage.getItem(CUSTOM_TEXT_KEY) ?? '');
const customEmoji = signal(localStorage.getItem(CUSTOM_EMOJI_KEY) ?? '🎯');
const customSize = signal<Size>(read<Size>(CUSTOM_SIZE_KEY, 'm'));
const customPattern = signal(localStorage.getItem(CUSTOM_PATTERN_KEY) === 'on');

const SIZE_TEXT: Record<Size, string> = { s: 'text-[7vw] md:text-5xl', m: 'text-[10vw] md:text-7xl', l: 'text-[14vw] md:text-8xl' };
const SIZE_EMOJI: Record<Size, string> = { s: 'text-4xl', m: 'text-6xl', l: 'text-8xl' };
const SIZES: Size[] = ['s', 'm', 'l'];

export default function CustomView() {
  const [startAt, setStartAt] = useState<number | null>(null);
  const [frozen, setFrozen] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startAt]);

  const elapsed = startAt !== null ? (now - startAt) / 1000 : frozen;
  const running = startAt !== null;

  const start = () => {
    requestNotifyPermission();
    setStartAt(Date.now());
    navigator.vibrate?.(10);
    void acquireWakeLock();
  };

  const stop = () => {
    if (startAt === null) return;
    const seconds = Math.round((Date.now() - startAt) / 1000);
    setFrozen(seconds);
    setStartAt(null);
    navigator.vibrate?.(50);
    void releaseWakeLock();
    addSession({
      id: crypto.randomUUID(),
      startedAt: Date.now() - seconds * 1000,
      endedAt: Date.now(),
      duration: seconds,
      mode: 'custom',
      cycles: 1,
      label: customText.value,
      emoji: customEmoji.value,
    });
    notify('Sesión guardada', `${formatTime(seconds)} de enfoque`);
  };

  const message = customText.value || 'EN LLAMADA';

  return (
    <div class="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-line md:grid-cols-5 anim-rise">
      {/* Room-facing pane, mirrors Cockpit mode. */}
      <div class={`relative flex min-h-[40vh] flex-col items-center justify-center gap-6 bg-black text-white select-none md:col-span-3 ${customPattern.value ? 'dot-grid' : ''}`}>
        <div class="absolute top-0 left-0 h-1.5 bg-accent" style={{ width: running ? '100%' : '0' }} />
        <p class={`px-6 text-center font-display font-black uppercase leading-none tracking-tight ${SIZE_TEXT[customSize.value]}`}>{message}</p>
        <p class={SIZE_EMOJI[customSize.value]} aria-hidden="true">{customEmoji.value}</p>
        <div class="absolute bottom-0 left-0 h-1.5 bg-accent" style={{ width: running ? '100%' : '0' }} />
      </div>

      {/* Control pane: personalization + timer. */}
      <div class="flex flex-col gap-5 border-t border-line p-6 md:col-span-2 md:border-t-0 md:border-l">
        <div class="flex items-center justify-center gap-3">
          {running && <span class="rec anim-pulse" aria-label="en progreso" />}
          <time class="text-5xl font-display font-bold tabular-nums">{formatTime(elapsed)}</time>
        </div>

        <input
          value={customText.value}
          maxLength={100}
          placeholder="En llamada..."
          aria-label="Mensaje"
          onInput={(e) => {
            customText.value = sanitizeCustomText((e.target as HTMLInputElement).value);
            localStorage.setItem(CUSTOM_TEXT_KEY, customText.value);
          }}
          class="w-full border-b border-line bg-transparent py-2 text-center font-display text-lg text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <p class="-mt-3 text-right text-[11px] font-display text-muted">{customText.value.length}/100</p>

        <div class="grid grid-cols-5 gap-2" role="group" aria-label="Selección de emoji">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={`Emoji ${e}`}
              aria-pressed={customEmoji.value === e}
              onClick={() => {
                customEmoji.value = e;
                localStorage.setItem(CUSTOM_EMOJI_KEY, e);
              }}
              class={`h-11 w-11 rounded-full text-2xl transition-colors ${customEmoji.value === e ? 'bg-panel ring-1 ring-accent' : 'hover:bg-panel'}`}
            >
              {e}
            </button>
          ))}
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="text-xs uppercase tracking-widest text-muted">Tamaño</span>
          <div class="segmented" role="tablist" aria-label="Tamaño del texto">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={customSize.value === s}
                onClick={() => {
                  customSize.value = s;
                  localStorage.setItem(CUSTOM_SIZE_KEY, s);
                }}
                class={`segmented-item ${customSize.value === s ? 'bg-ink text-base' : 'text-muted hover:text-ink'}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="text-xs uppercase tracking-widest text-muted">Retícula de puntos</span>
          <button
            type="button"
            role="switch"
            aria-label="Retícula de puntos"
            aria-checked={customPattern.value}
            onClick={() => {
              customPattern.value = !customPattern.value;
              localStorage.setItem(CUSTOM_PATTERN_KEY, customPattern.value ? 'on' : 'off');
            }}
            class="switch"
          >
            <span class="switch-knob" />
          </button>
        </div>

        <button
          class={`btn-icon mx-auto h-16 w-16 text-xl ${running ? 'btn-accent' : 'btn-primary'}`}
          onClick={running ? stop : start}
          aria-label={running ? 'Detener' : 'Iniciar'}
        >
          {running ? '■' : '▶'}
        </button>
      </div>
    </div>
  );
}
