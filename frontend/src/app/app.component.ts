import {Component} from '@angular/core';
import {UserService} from './service/user.service';
import {Router, RouterOutlet} from '@angular/router';
import {LoadingInterceptor} from './http-interceptors/loading.interceptor';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf} from '@angular/common';
import {URLS} from './app.routes';
import {SendIntent} from 'send-intent';
import {Filesystem} from '@capacitor/filesystem';
import {UploadPostJourneyService} from './components/pages/upload-page/upload-post-journey.service';
import {App} from '@capacitor/app';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatProgressSpinner,
    AsyncPipe,
    NgIf,
  ],
  providers: [
    UserService,
  ],
  template: `
    <router-outlet></router-outlet>
    <div class="loading" *ngIf="loading$ | async">
      <mat-spinner diameter="35"></mat-spinner>
    </div>
  `,
  styles: [`.loading {
    position: fixed;
    z-index: 99;
    bottom: 35px;
    left: 35px;
    opacity: 0;
    animation: fadeIn 0.5s ease-in 0.1s forwards;
  }`]
})
export class AppComponent {
  loading$;

  constructor(loadingInterceptor: LoadingInterceptor,
              postJourney: UploadPostJourneyService
  ) {
    this.loading$ = loadingInterceptor.loading$;
    postJourney.checkShare();
  }
}
