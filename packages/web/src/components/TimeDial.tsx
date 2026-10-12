import { useRef, useState } from 'preact/hooks';
import { consumeSteps, normalizeDeg } from '@busy-bar/shared';

const CX = 160;
const CY = 160;
const R = 130;
const DEG_PER_STEP = 6; // one step == one minute, so a full turn == 60 min
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

// Infinite rotary dial: drag the thumb to add/remove minutes. Rotation is
// relative and unclamped, so you can spin it as many turns as you want.
export default function TimeDial({ onSteps, onClose }: { onSteps: (steps: number) => void; onClose: () => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const last = useRef<number | null>(null);
  const accum = useRef(0);
  const [visual, setVisual] = useState(0);
  const [total, setTotal] = useState(0);

  const angleFor = (e: PointerEvent): number => {
    const rect = svg.current!.getBoundingClientRect();
    return (Math.atan2(CY - (e.clientY - rect.top), e.clientX - rect.left - CX) * 180) / Math.PI;
  };

  const onDown = (e: PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    last.current = angleFor(e);
  };

  const onMove = (e: PointerEvent) => {
    if (last.current === null) return;
    const angle = angleFor(e);
    const delta = normalizeDeg(angle - last.current);
    last.current = angle;
    accum.current += delta;
    const { steps, remainder } = consumeSteps(accum.current, DEG_PER_STEP);
    accum.current = remainder;
    if (steps) {
      onSteps(steps);
      setTotal((t) => t + steps);
    }
    setVisual((v) => v + delta);
  };

  const onUp = (e: PointerEvent) => {
    last.current = null;
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
  };

  const rad = (visual * Math.PI) / 180;
  const thumbX = CX + R * Math.sin(rad);
  const thumbY = CY - R * Math.cos(rad);

  return (
    <div class="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-base/70 backdrop-blur-sm" data-no-gesture onClick={onClose}>
      <div class="relative">
        <svg
          ref={svg}
          width="320"
          height="320"
          viewBox="0 0 320 320"
          class="touch-none"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="slider"
          aria-label="Ajustar minutos (giro infinito)"
          aria-valuetext={`${total} min`}
        >
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgb(var(--line))" stroke-width="4" />
          {TICKS.map((a) => {
            const t = (a * Math.PI) / 180;
            const x1 = CX + (R - 10) * Math.sin(t);
            const y1 = CY - (R - 10) * Math.cos(t);
            const x2 = CX + (R - 24) * Math.sin(t);
            const y2 = CY - (R - 24) * Math.cos(t);
            return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--line))" stroke-width="3" stroke-linecap="round" />;
          })}
          <circle cx={thumbX} cy={thumbY} r="16" fill="rgb(var(--ink))" style={{ transition: 'cx 0.02s linear, cy 0.02s linear' }} />
          <circle cx={thumbX} cy={thumbY} r="6" fill="rgb(var(--accent))" />
        </svg>
        <p class="pointer-events-none absolute inset-0 grid place-items-center font-display text-4xl font-bold tabular-nums">
          {total > 0 ? `+${total}` : total < 0 ? `${total}` : '0'}
        </p>
      </div>
      <p class="font-display text-xs uppercase tracking-widest text-muted">Gira para sumar minutos · toca fuera para cerrar</p>
    </div>
  );
}