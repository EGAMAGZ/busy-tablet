import { App } from '@capacitor/app';

export async function detectMicrophoneActive(threshold = 30): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close();
    return avg > threshold;
  } catch {
    return false;
  }
}

// Foreground-only watcher (local, no server). iOS suspends timers in the
// background, so detection runs while the app is active and stops on exit.
export function startCallWatcher(onCall: () => void, intervalMs = 15000): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    if (timer) return;
    timer = setInterval(async () => {
      if (await detectMicrophoneActive()) onCall();
    }, intervalMs);
  };
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  start();
  const listener = App.addListener('appStateChange', ({ isActive }) => (isActive ? start() : stop()));
  return () => {
    stop();
    void listener.then((l) => l.remove());
  };
}
