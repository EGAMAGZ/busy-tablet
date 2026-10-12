import { useState } from 'preact/hooks';
import { SIGN_LABEL } from '@busy-bar/shared';
import ProgressRing from './ProgressRing';
import ControlBar from './ControlBar';
import TimeDial from './TimeDial';
import { publicStatus } from '../state';
import type { SessionControls } from '../hooks/useSession';

// Split view: left 60% faces the room (public status), right 40% faces you.
export default function Cockpit({ session, onExit }: { session: SessionControls; onExit: () => void }) {
  const width = `${Math.round(session.progress * 100)}%`;
  const status = publicStatus.value ?? SIGN_LABEL[session.state] ?? 'LIBRE';
  const active = session.isTimed || session.paused;
  const bar = active ? 'bg-accent' : 'bg-white';
  const [dial, setDial] = useState(false);

  return (
    <div class="fixed inset-0 z-40 grid grid-cols-5 bg-base text-ink anim-rise">
      <div class="col-span-3 relative flex items-center justify-center bg-black text-white select-none dot-grid">
        <div class={`absolute top-0 left-0 h-1.5 transition-[width] duration-300 ${bar}`} style={{ width }} />
        <div class="absolute top-0 bottom-0 left-0 w-1.5 overflow-hidden">
          {active && <div class="sweep absolute inset-0" />}
        </div>
        <p class="px-4 text-center text-[9vw] font-display font-black uppercase leading-none tracking-tight">{status}</p>
        <div class={`absolute bottom-0 left-0 h-1.5 transition-[width] duration-300 ${bar}`} style={{ width }} />
      </div>

      <div class="col-span-2 flex flex-col items-center justify-center gap-6 border-l border-line p-6">
        <p class="text-xs font-display uppercase tracking-widest text-muted">{session.phaseLabel}</p>
        <button
          type="button"
          onClick={() => setDial(true)}
          aria-label="Ajustar tiempo con el dial"
          class="text-5xl font-display font-bold tabular-nums cursor-pointer"
        >
          {session.displayTime}
        </button>
        <ProgressRing progress={session.progress} active={session.isTimed} />
        <p class="text-xs font-display text-muted">
          Ciclo {session.cycle} de {session.cycles}
        </p>
        <ControlBar
          running={session.isTimed}
          paused={session.state === 'paused'}
          completed={session.completed}
          onPlay={session.play}
          onPause={session.pause}
          onResume={session.resume}
          onStop={session.stop}
        />
        <button type="button" class="btn-ghost" onClick={onExit} aria-label="Salir del cockpit">
          SALIR
        </button>
      </div>

      {dial && (
        <TimeDial
          onSteps={(steps) => {
            session.adjustSeconds(steps * 60);
            navigator.vibrate?.(10);
          }}
          onClose={() => setDial(false)}
        />
      )}
    </div>
  );
}