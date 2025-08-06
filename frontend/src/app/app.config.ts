import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideServiceWorker} from '@angular/service-worker';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {ApiModule} from './api/api.module';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getMessaging, provideMessaging} from '@angular/fire/messaging';
import {initIdentity} from './core/init';
import {GlobalErrorHandler} from './core/services/error.handler';
import {ErrorHandlerInterceptor} from './core/interceptors/http-error.interceptor';
import {AuthenticationInterceptor} from './core/interceptors/authentication.interceptor';
import {LoadingInterceptor} from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(ApiModule.forRoot({rootUrl: localStorage.getItem('url') || 'https://192.168.178.179:4200'})),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideAppInitializer(initIdentity()),
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    provideFirebaseApp(() => initializeApp({
      apiKey: 'AIzaSyCKAJptxgeraB0OvlX5dq5g4Bw18M0g-SU',
      authDomain: 'erizo-3e72a.firebaseapp.com',
      projectId: 'erizo-3e72a',
      storageBucket: 'erizo-3e72a.firebasestorage.app',
      messagingSenderId: '1074541584385',
      appId: '1:1074541584385:web:fe2c9505356e139e332000',
    })),
    provideMessaging(() => getMessaging()),
    {provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useExisting: LoadingInterceptor, multi: true},
    provideServiceWorker('/ngsw-worker.js', {
      enabled: false,
      registrationStrategy: 'registerImmediately',
    })],
};
