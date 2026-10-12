export default function ProgressRing({ progress, active = false }: { progress: number; active?: boolean }) {
  const c = 2 * Math.PI * 90;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg class="w-40 h-40 -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgb(var(--line))" stroke-width="3" />
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke={active ? 'rgb(var(--accent))' : 'rgb(var(--ink))'}
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray={c}
        stroke-dashoffset={c * (1 - p)}
        style={{ transition: 'stroke-dashoffset 0.3s linear, stroke 0.3s linear' }}
      />
    </svg>
  );
}
