import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatBadge} from '@angular/material/badge';
import {AsyncPipe} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LockscreenComponent} from '../lockscreen/lockscreen.component';
import {URLS} from '../../../app.routes';
import {NotificationService} from '../../../features/notification/services/notification.service';

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
      this.snackBar.open('An error occurred while checking notifications: ' + error.message, '', {duration: 5000});
    }
  }


}
