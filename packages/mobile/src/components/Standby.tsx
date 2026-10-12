import { useEffect, useState } from 'preact/hooks';
import StatsCard from './StatsCard';
import type { SessionControls } from '../hooks/useSession';

// ponytail: dims via CSS opacity only. Real backlight control needs
// @capacitor/screen-brightness (not installed). Add it when battery/measure
// shows black pixels alone aren't enough.
export default function Standby({ session }: { session: SessionControls }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div class="flex flex-col items-center justify-center gap-6 text-center opacity-40">
      <p class="text-muted text-sm font-display uppercase tracking-widest">Disponible</p>
      <time class="text-8xl font-display font-bold tabular-nums anim-flicker" aria-label="Hora actual">
        {clock}
      </time>
      <StatsCard />
      <button class="btn-ghost" onClick={session.reset} aria-label="Nueva sesión">
        NUEVA SESIÓN
      </button>
    </div>
  );
}
