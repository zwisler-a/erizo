import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {SafeArea} from 'capacitor-plugin-safe-area';

SafeArea.addListener('safeAreaChanged', data => {
  const { insets } = data;
  console.log('safeAreaChanged', insets);
  for (let [key, value] of Object.entries(insets)) {
    if(key === 'top') value = Math.max(value, 8);
    document.documentElement.style.setProperty(
      `--safe-area-inset-${key}`,
      `${value}px`,
    );
  }
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
