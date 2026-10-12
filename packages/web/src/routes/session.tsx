import SessionTimer from '../components/SessionTimer';
import type { SessionControls } from '../hooks/useSession';

export default function SessionPage({ session }: { session: SessionControls; path?: string }) {
  return <SessionTimer session={session} />;
}