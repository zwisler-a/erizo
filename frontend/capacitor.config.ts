import type { CapacitorConfig } from '@capacitor/cli';
import {KeyboardResize} from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'de.zwisler.erizo',
  appName: 'erizo',
  webDir: 'dist/frontend/browser',
  plugins: {
    PrivacyScreen: {
      enable: true,
      imageName: "Splashscreen",
      contentMode: "scaleAspectFit",
      preventScreenshots: false
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
  /*server: {
    url: "https://192.168.178.179:4200",
    cleartext: true
  }*/
};

export default config;
