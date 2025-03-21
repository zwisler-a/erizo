import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {Notification, NotificationService} from '../service/notification.service';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-notifications',
  imports: [
    MatListModule,
    AsyncPipe,
    MatIcon,
    RouterLink
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {

  notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = notificationService.getNotifications();
  }

  notificationClicked(notification: Notification) {
    this.notificationService.removeNotification(notification.id);
  }
}
