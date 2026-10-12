import { useEffect, useRef, useState } from 'preact/hooks';
import { attachGestures } from '@busy-bar/shared';
import ProgressRing from './ProgressRing';
import ControlBar from './ControlBar';
import Cockpit from './Cockpit';
import Standby from './Standby';
import TimeDial from './TimeDial';
import { impact } from '../services/capacitor';
import type { SessionControls } from '../hooks/useSession';

export default function SessionTimer({ session }: { session: SessionControls }) {
  const el = useRef<HTMLDivElement>(null);
  const [cockpit, setCockpit] = useState(false);
  const [dial, setDial] = useState(false);
  const [flash, setFlash] = useState(0);
  const prevPhase = useRef(session.phaseLabel);

  useEffect(() => {
    if (!el.current) return;
    return attachGestures(el.current, {
      onSwipeUp: () => session.adjustSeconds(60),
      onSwipeDown: () => session.adjustSeconds(-60),
      onDoubleTap: session.toggle,
      onTap: () => setDial(true),
      onLongPress: session.stop,
      onSwipeLeft: session.skip,
      onSwipeRight: session.skip,
    });
  }, [session.state]);

  // Red flash when the phase turns over ("destello").
  useEffect(() => {
    if (prevPhase.current === session.phaseLabel) return;
    prevPhase.current = session.phaseLabel;
    setFlash((n) => n + 1);
  }, [session.phaseLabel]);

  if (session.completed) {
    return (
      <div ref={el}>
        <Standby session={session} />
      </div>
    );
  }

  if (cockpit) {
    return <Cockpit session={session} onExit={() => setCockpit(false)} />;
  }

  return (
    <div ref={el} class="relative flex flex-col items-center justify-center gap-8 touch-none anim-rise">
      {session.isTimed && (
        <div class="pointer-events-none fixed top-0 left-0 z-20 h-1 bg-accent transition-[width] duration-300" style={{ width: `${session.progress * 100}%` }} />
      )}
      {flash > 0 && <div key={flash} class="anim-flash pointer-events-none fixed inset-0 z-30 bg-accent/20" />}
      <p class="flex items-center gap-2 text-muted text-sm font-display uppercase tracking-widest">
        {session.phaseLabel}
        {session.isTimed && <span class="rec anim-pulse" aria-label="en progreso" />}
      </p>
      <time class="text-7xl md:text-8xl font-display font-bold tabular-nums" aria-live="polite">
        {session.displayTime}
      </time>
      <ProgressRing progress={session.progress} active={session.isTimed} />
      <p class="text-muted text-xs font-display">
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
      <div class="flex gap-3">
        <button type="button" class="btn-ghost" onClick={() => setCockpit(true)} aria-label="Modo cockpit (vista dividida)">
          COCKPIT
        </button>
      </div>
      {dial && (
        <TimeDial
          onSteps={(steps) => {
            session.adjustSeconds(steps * 60);
            void impact('light');
          }}
          onClose={() => setDial(false)}
        />
      )}
    </div>
  );
}
