import {Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatListItem, MatListItemIcon, MatListItemLine, MatListItemTitle} from '@angular/material/list';
import {DatePipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {RouterLink} from '@angular/router';
import {URLS} from '../../../../app.routes';
import {PushNotificationSchema} from '@capacitor/push-notifications';
import {AliasPipePipe} from '../../../../shared/pipes/alias.pipe';
import {NotificationService} from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  imports: [
    MatIcon,
    MatListItem,
    MatListItemIcon,
    MatListItemLine,
    MatListItemTitle,
    NgIf,
    RouterLink,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    AliasPipePipe,
    DatePipe,
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  @Input()
  notification!: PushNotificationSchema;

  constructor(private notificationService: NotificationService) {
  }

  notificationClicked(notification: PushNotificationSchema) {
    this.notificationService.removeNotification(notification.id);
  }

  protected readonly URLS = URLS;
}
