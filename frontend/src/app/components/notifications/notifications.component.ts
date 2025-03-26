import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {NotificationService} from '../../service/notification.service';
import {Observable} from 'rxjs';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import { MessagePayload } from '@angular/fire/messaging';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-notifications',
  imports: [
    MatListModule,
    AsyncPipe,
    MatIcon,
    RouterLink,
    JsonPipe,
    MatButton,
    NgIf,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {

  notifications$: Observable<MessagePayload[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = notificationService.getNotifications();
  }

  notificationClicked(notification: MessagePayload) {
    this.notificationService.removeNotification(notification.messageId);
  }
}
