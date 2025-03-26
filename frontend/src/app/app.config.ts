import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { initIdentity } from './service/init';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorHandlerInterceptor } from './http-interceptors/http-error.interceptor';
import { ApiModule } from './api/api.module';
import { AuthenticationInterceptor } from './http-interceptors/authentication.interceptor';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(ApiModule.forRoot({ rootUrl: '' })),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideAppInitializer(initIdentity()),
    provideFirebaseApp(() => initializeApp({
      apiKey: 'AIzaSyCKAJptxgeraB0OvlX5dq5g4Bw18M0g-SU',
      authDomain: 'erizo-3e72a.firebaseapp.com',
      projectId: 'erizo-3e72a',
      storageBucket: 'erizo-3e72a.firebasestorage.app',
      messagingSenderId: '1074541584385',
      appId: '1:1074541584385:web:fe2c9505356e139e332000',
    })),
    provideMessaging(() => getMessaging()),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true },
    provideServiceWorker('/firebase-messaging-sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
    })],
};
