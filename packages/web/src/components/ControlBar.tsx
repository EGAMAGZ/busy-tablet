interface Props {
  running: boolean;
  paused: boolean;
  completed: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function ControlBar({ running, paused, completed, onPlay, onPause, onResume, onStop }: Props) {
  if (completed) return null;
  const primary = running ? 'btn-accent' : 'btn-primary';
  return (
    <div class="flex items-center gap-4 justify-center">
      <button
        class={`btn-icon ${primary} h-16 w-16 text-xl`}
        onClick={running ? onPause : paused ? onResume : onPlay}
        aria-label={running ? 'Pausar' : paused ? 'Reanudar' : 'Iniciar'}
      >
        {running ? '❚❚' : '▶'}
      </button>
      <button class="btn-icon btn-ghost h-11 w-11 text-sm" onClick={onStop} aria-label="Detener">
        ■
      </button>
    </div>
  );
}
