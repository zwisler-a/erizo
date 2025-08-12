import type { CapacitorConfig } from '@capacitor/cli';
import {KeyboardResize} from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'de.zwisler.erizo',
  appName: 'erizo',
  webDir: 'dist/frontend/browser',
  plugins: {
    PrivacyScreen: {
      enable: true,
      imageName: "icon512_maskable.png",
      contentMode: "scaleAspectFit",
      preventScreenshots: true
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
