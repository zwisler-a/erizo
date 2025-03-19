import {ApplicationConfig, provideZoneChangeDetection, isDevMode, provideAppInitializer, inject} from '@angular/core';
import {provideRouter} from '@angular/router';
import {LOAD_WASM} from 'ngx-scanner-qrcode';
import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideServiceWorker} from '@angular/service-worker';
import {initIdentity} from './service/init';
import {KeyService} from './service/key.service';
import {ContactService} from './service/contact.service';

LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideAppInitializer(initIdentity()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })]
};
