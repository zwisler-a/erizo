import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { NotificationService } from '../../../service/notification.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { MessagePayload } from '@angular/fire/messaging';
import { NotificationComponent } from './notification/notification.component';
import {PushNotificationSchema} from '@capacitor/push-notifications';

@Component({
  selector: 'app-notification-page',
  imports: [
    MatListModule,
    AsyncPipe,
    NgIf,
    NotificationComponent,
  ],
  templateUrl: './notification-page.component.html',
  styleUrl: './notification-page.component.css'
})
export class NotificationPageComponent {

  notifications$: Observable<PushNotificationSchema[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = notificationService.getNotifications();
  }

  notificationClicked(notification: MessagePayload) {
    this.notificationService.removeNotification(notification.messageId);
  }
}
