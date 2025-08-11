import { AfterViewInit, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { AsyncPipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LockscreenComponent } from '../lockscreen/lockscreen.component';
import { URLS } from '../../../app.routes';
import { NotificationService } from '../../../features/notification/services/notification.service';
import { SplashScreen } from '@capacitor/splash-screen';
import {PrivacyLockComponent} from '../privacy-lock/privacy-lock.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    RouterLinkActive,
    MatBadge,
    AsyncPipe,
    MatMenuModule,
    LockscreenComponent,
    PrivacyLockComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent implements AfterViewInit {
  protected readonly URLS = URLS;
  notifications$;


  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
  ) {
    this.notifications$ = notificationService.getNotifications();
    this.handleNotifications();
  }

  ngAfterViewInit(): void {
    SplashScreen.hide()
  }


  private async handleNotifications() {
    try {
      await this.notificationService.enableNotifications();
    } catch (error: any) {
      this.snackBar.open('An error occurred while checking notifications: ' + error.message, '', { duration: 5000 });
    }
  }


}
