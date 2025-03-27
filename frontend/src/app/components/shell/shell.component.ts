import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContactService } from '../../service/contact.service';
import { NotificationService } from '../../service/notification.service';
import { MatBadge } from '@angular/material/badge';
import { AsyncPipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { URLS } from '../../app.routes';

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
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  protected readonly URLS = URLS;
  notifications$;

  constructor(public contactService: ContactService, notificationService: NotificationService) {
    this.notifications$ = notificationService.getNotifications();
  }


}
