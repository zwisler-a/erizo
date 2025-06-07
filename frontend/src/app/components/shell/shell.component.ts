import { Component, HostListener, NgZone } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContactService } from '../../service/contact.service';
import { NotificationService } from '../../service/notification.service';
import { MatBadge } from '@angular/material/badge';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { URLS } from '../../app.routes';
import { BiometricsService } from '../../service/biometrics.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ERROR_SNACKBAR } from '../../util/snackbar-consts';
import { App } from '@capacitor/app';
import { LockscreenComponent } from './lockscreen/lockscreen.component';

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
    NgIf,
    LockscreenComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  protected readonly URLS = URLS;
  notifications$;


  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
  ) {
    this.notifications$ = notificationService.getNotifications();
    this.handleNotifications();
  }


  private async handleNotifications() {
    try {
      await this.notificationService.enableNotifications();
    } catch (error: any) {
      this.snackBar.open('An error occurred while checking notifications: ' + error.message, '', { duration: 5000 });
    }
  }


}
