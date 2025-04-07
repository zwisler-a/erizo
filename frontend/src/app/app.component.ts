import {Component} from '@angular/core';
import {UserService} from './service/user.service';
import {RouterOutlet} from '@angular/router';
import {ContactService} from './service/contact.service';
import {NotificationService} from './service/notification.service';
import {LoadingInterceptor} from './http-interceptors/loading.interceptor';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {AsyncPipe, NgIf} from '@angular/common';

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
    <div class="loading" *ngIf="loading$|async">
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles: [`.loading {
    position: fixed;
    bottom: 20px;
    right: 20px;
  }`]
})
export class AppComponent {
  loading$;

  constructor(loadingInterceptor: LoadingInterceptor, private notificationService: NotificationService) {
    this.loading$ = loadingInterceptor.loading$;
  }

}
