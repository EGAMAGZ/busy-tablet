import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.busybar.app',
  appName: 'BUSY Bar',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: { enabled: true },
  },
};

export default config;
