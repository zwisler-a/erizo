import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf} from '@angular/common';
import {UserService} from './core/services/user.service';
import {LoadingInterceptor} from './core/interceptors/loading.interceptor';
import {UploadPostJourneyService} from './features/post/services/upload-post-journey.service';

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
