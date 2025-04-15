import type { CapacitorConfig } from '@capacitor/cli';

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
    }
  }
};

export default config;
