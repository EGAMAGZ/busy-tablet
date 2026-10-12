import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNative = Capacitor.isNativePlatform();

export async function impact(kind: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
  if (!isNative) {
    navigator.vibrate?.(kind === 'heavy' ? 200 : kind === 'medium' ? 100 : 20);
    return;
  }
  const style = kind === 'heavy' ? ImpactStyle.Heavy : kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
  try {
    await Haptics.impact({ style });
  } catch {
    /* device without haptics */
  }
}

export async function initNative(): Promise<void> {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    /* status bar unavailable */
  }
}

export async function describeDevice(): Promise<string> {
  try {
    const info = await Device.getInfo();
    return `${info.model} · ${info.operatingSystem} ${info.osVersion}`;
  } catch {
    return 'Dispositivo no disponible';
  }
}
