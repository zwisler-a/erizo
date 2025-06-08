import type { CapacitorConfig } from '@capacitor/cli';
import {KeyboardResize} from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'de.zwisler.erizo',
  appName: 'erizo',
  webDir: 'dist/frontend/browser',
  plugins: {
    PrivacyScreen: {
      enable: true,
      preventScreenshots: true
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
    SafeArea: {
      enabled: true,
      customColorsForSystemBars: true,
      statusBarColor: '#000000',
      statusBarContent: 'light',
      navigationBarColor: '#000000',
      navigationBarContent: 'light',
      offset: 0,
    },
  },
  /*server: {
    url: "https://192.168.0.53:4200"
  }*/
};

export default config;
