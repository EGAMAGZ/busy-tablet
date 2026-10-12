import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from './capacitor';
import { beep } from '@busy-bar/shared';

let id = 1;

export async function requestNotifyPermission(): Promise<void> {
  if (isNative) {
    try {
      await LocalNotifications.requestPermissions();
    } catch {
      /* permission UI unavailable */
    }
    return;
  }
  if ('Notification' in window && Notification.permission === 'default') {
    void Notification.requestPermission();
  }
}

// Local-only: schedules an immediate native notification (falls back to the
// Web Notification API when running in a browser).
export async function notify(title: string, body?: string): Promise<void> {
  beep();
  if (isNative) {
    try {
      await LocalNotifications.schedule({
        notifications: [{ id: id++, title, body: body ?? '', smallIcon: 'ic_stat_icon' }],
      });
    } catch {
      /* notifications disabled */
    }
    return;
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}
