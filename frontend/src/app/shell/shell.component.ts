import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ContactService} from '../service/contact.service';
import {NotificationService} from '../service/notification.service';
import {MatBadge} from '@angular/material/badge';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatMenu, MatMenuModule} from '@angular/material/menu';

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
  styleUrl: './shell.component.css'
})
export class ShellComponent {

  notifications$;

  constructor(public contactService: ContactService, notificationService: NotificationService) {
    this.notifications$ = notificationService.getNotifications();
    this.startSync();
  }


  startSync() {
    this.contactService.syncContacts();
    setInterval(() => {
      this.contactService.syncContacts();
    }, 10000);
  }

}
