import { PUBLIC_STATUSES } from '@busy-bar/shared';
import { publicStatus, setPublicStatus } from '../state';

export default function QuickPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = [{ id: null as string | null, label: 'AUTO', glyph: '◌' }, ...PUBLIC_STATUSES];

  return (
    <div class={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} onClick={onClose}>
      <div
        class={`absolute inset-y-0 left-0 flex w-64 flex-col gap-1 border-r border-line bg-panel p-4 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Cambiar estado"
        onClick={(e) => e.stopPropagation()}
      >
        <p class="mb-3 font-display text-xs uppercase tracking-widest text-muted">Estado</p>
        {items.map((it) => {
          const active = publicStatus.value === it.id;
          return (
            <button
              key={it.id ?? 'auto'}
              type="button"
              onClick={() => {
                setPublicStatus(it.id);
                onClose();
              }}
              class={`flex items-center gap-3 min-h-11 rounded-full px-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                active ? 'text-ink' : 'text-muted hover:text-ink hover:bg-base'
              }`}
            >
              <span
                class={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${
                  active ? 'border-accent bg-accent text-white' : 'border-line'
                }`}
                aria-hidden="true"
              >
                {it.glyph}
              </span>
              <span class="font-display">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
