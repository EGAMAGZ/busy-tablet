import { Router } from 'preact-router';
import { useEffect, useState } from 'preact/hooks';
import ModeSelector from './components/ModeSelector';
import QuickPanel from './components/QuickPanel';
import SessionPage from './routes/session';
import CustomRoute from './routes/custom';
import StatsRoute from './routes/stats';
import SettingsRoute from './routes/settings';
import { useSession } from './hooks/useSession';
import { theme } from './state';

export default function App() {
  const session = useSession();
  const [path, setPath] = useState(() => location.pathname);
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme.value === 'light');
  }, [theme.value]);

  return (
    <div class="min-h-screen flex flex-col bg-base text-ink font-sans">
      <header class="sticky top-0 z-10 flex justify-center p-4 bg-base/80 backdrop-blur-sm">
        <ModeSelector path={path} />
      </header>
      <main class="flex-1 flex items-center justify-center px-6 pb-10">
        <Router onChange={(e) => setPath((e.url ?? location.pathname).split('?')[0])}>
          <SessionPage path="/" session={session} />
          <SessionPage path="/session" session={session} />
          <CustomRoute path="/custom" />
          <StatsRoute path="/stats" />
          <SettingsRoute path="/settings" />
        </Router>
      </main>
      <button
        type="button"
        onClick={() => setPanel(true)}
        aria-label="Cambiar estado"
        class="fixed left-0 top-1/2 z-40 grid h-16 w-6 -translate-y-1/2 place-items-center rounded-r-2xl border border-l-0 border-line bg-panel"
      >
        <span class="flex flex-col gap-1" aria-hidden="true">
          <span class="h-1 w-1 rounded-full bg-muted" />
          <span class="h-1 w-1 rounded-full bg-muted" />
          <span class="h-1 w-1 rounded-full bg-muted" />
        </span>
      </button>
      <QuickPanel open={panel} onClose={() => setPanel(false)} />
    </div>
  );
}