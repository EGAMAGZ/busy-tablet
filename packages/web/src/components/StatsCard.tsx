import { computeStats, loadSessions } from '@busy-bar/shared';

export default function StatsCard() {
  const stats = computeStats(loadSessions());
  const rows: [string, string][] = [
    ['Sesiones hoy', String(stats.todayCount)],
    ['Minutos hoy', String(stats.todayMinutes)],
    ['Total horas', String(stats.totalHours)],
    ['Racha', `${stats.streak} ${stats.streak === 1 ? 'día' : 'días'}`],
  ];
  return (
    <div class="widget w-full max-w-sm">
      <h2 class="text-muted text-sm font-display uppercase tracking-widest mb-6">Estadísticas</h2>
      <dl class="divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} class="flex items-center justify-between py-4">
            <dt class="text-sm text-muted uppercase tracking-wide">{label}</dt>
            <dd class="text-3xl font-display font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
