export interface GestureHandlers {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SWIPE_THRESHOLD = 60;
const TAP_TIMEOUT = 250;
const LONG_PRESS_MS = 700;

export function attachGestures(el: HTMLElement, handlers: GestureHandlers): () => void {
  let startX = 0;
  let startY = 0;
  let lastTap = 0;
  let multi = false;
  let multiResolved = false;
  let twoStartX = 0;
  let twoStartY = 0;
  let longPress: ReturnType<typeof setTimeout> | null = null;
  let tapTimer: ReturnType<typeof setTimeout> | null = null;

  const clearLongPress = () => {
    if (longPress) clearTimeout(longPress);
    longPress = null;
  };

  const clearTap = () => {
    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = null;
  };

  const onStart = (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      multi = true;
      multiResolved = false;
      const [a, b] = [e.touches[0], e.touches[1]];
      twoStartX = (a.clientX + b.clientX) / 2;
      twoStartY = (a.clientY + b.clientY) / 2;
      clearLongPress();
      if (handlers.onLongPress) {
        longPress = setTimeout(() => {
          multiResolved = true;
          handlers.onLongPress?.();
        }, LONG_PRESS_MS);
      }
      return;
    }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  // Two fingers dragged horizontally = skip block.
  const onMove = (e: TouchEvent) => {
    if (!multi || multiResolved || e.touches.length < 2) return;
    const [a, b] = [e.touches[0], e.touches[1]];
    const dx = (a.clientX + b.clientX) / 2 - twoStartX;
    const dy = (a.clientY + b.clientY) / 2 - twoStartY;
    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      multiResolved = true;
      clearLongPress();
      if (dx < 0) handlers.onSwipeLeft?.();
      else handlers.onSwipeRight?.();
    }
  };

  const onEnd = (e: TouchEvent) => {
    if (multi) {
      if (e.touches.length === 0) {
        multi = false;
        clearLongPress();
      }
      return;
    }
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const isTap = Math.hypot(dx, dy) < SWIPE_THRESHOLD;

    // Taps that land on a control belong to that control, not to gestures.
    if ((e.target as Element | null)?.closest('button, a, input, [role="slider"], [data-no-gesture]')) {
      lastTap = 0;
      return;
    }

    if (isTap && (handlers.onDoubleTap || handlers.onTap)) {
      const now = Date.now();
      if (now - lastTap < TAP_TIMEOUT && handlers.onDoubleTap) {
        clearTap();
        handlers.onDoubleTap();
        lastTap = 0;
        return;
      }
      lastTap = now;
      // Delay the single tap so a following tap is read as a double tap.
      if (handlers.onTap) {
        clearTap();
        tapTimer = setTimeout(() => {
          tapTimer = null;
          handlers.onTap?.();
        }, TAP_TIMEOUT);
      }
      return;
    }
    lastTap = 0;

    if (Math.abs(dy) >= SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) handlers.onSwipeUp?.();
      else handlers.onSwipeDown?.();
    }
  };

  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchmove', onMove, { passive: true });
  el.addEventListener('touchend', onEnd, { passive: true });
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    clearLongPress();
    clearTap();
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchmove', onMove);
    el.removeEventListener('touchend', onEnd);
  };
}
