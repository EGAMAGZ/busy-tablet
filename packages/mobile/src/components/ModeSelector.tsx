import { route } from 'preact-router';

const ITEMS = [
  { path: '/session', label: 'Busy' },
  { path: '/custom', label: 'Custom' },
  { path: '/stats', label: 'Stats' },
  { path: '/settings', label: 'Ajustes' },
];

export default function ModeSelector({ path }: { path: string }) {
  return (
    <div class="segmented" role="tablist" aria-label="Modos">
      {ITEMS.map((item) => {
        const active = item.path === '/session' ? path === '/' || path === '/session' : path === item.path;
        return (
          <button
            key={item.path}
            type="button"
            role="tab"
            onClick={() => route(item.path)}
            aria-selected={active}
            class={`segmented-item ${active ? 'bg-ink text-base' : 'text-muted hover:text-ink'}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
