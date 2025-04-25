import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import {AsyncPipe, DatePipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../../service/notification.service';
import { MessagePayload } from '@angular/fire/messaging';
import { URLS } from '../../../../app.routes';
import { AliasPipePipe } from '../../../shared/alias-pipe/alias.pipe';

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
    AsyncPipe,
    DatePipe,
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  @Input()
  notification!: MessagePayload;

  constructor(private notificationService: NotificationService) {
  }

  notificationClicked(notification: MessagePayload) {
    this.notificationService.removeNotification(notification.messageId);
  }

  protected readonly URLS = URLS;
}
