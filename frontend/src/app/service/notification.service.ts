import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, concat, fromEvent, Observable} from 'rxjs';
import {getToken, Messaging, onMessage} from '@angular/fire/messaging';
import {ApiUserService} from '../api/services/api-user.service';
import {MessagePayload} from '@angular/fire/messaging';
import {NotificationPersistenceService} from './notification-persistance.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map} from 'rxjs/operators';
import {ERROR_SNACKBAR} from '../util/snackbar-consts';

export enum NotificationType {
  NEW_POST = 'NEW_POST',
  DEVICE_ADDED = 'DEVICE_ADDED',
  CONNECTION_ADDED = 'CONNECTION_ADDED',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  LIKE_POST = 'LIKE_POST',
}

export interface NotificationPayload {
  type: NotificationType;
  thread_id?: string;
  post_id?: string;
  fingerprint?: string;
  timestamp?: string;
}

@Injectable({providedIn: 'root'})
export class NotificationService {
  private notifications$ = new BehaviorSubject<MessagePayload[]>([]);
  private fcmMessages$?: Observable<MessagePayload>;
  private msg?: Messaging;

  constructor(
    private userApi: ApiUserService,
    private persistenceService: NotificationPersistenceService,
    private snackBar: MatSnackBar
  ) {
    this.tryInitMessaging();
    this.refreshNotifications();
    fromEvent(window, 'focus').subscribe(() => {
      this.refreshNotifications();
    });
  }

  private tryInitMessaging() {
    try {
      this.msg = inject(Messaging);
      if (!this.msg) return;
      this.fcmMessages$ = new Observable<MessagePayload>((sub) => onMessage(this.msg!, (msg) => sub.next(msg)));
      this.fcmMessages$.subscribe(async (msg: any) => {
        await this.addNotification(msg);
        await this.refreshNotifications();
      });
    } catch (e) {
      this.snackBar.open("Something went wrong! Maybe enable Notifications und the User-Page?", 'Ok', ERROR_SNACKBAR);
    }
  }

  async addNotification(payload: MessagePayload) {
    try {
      await this.persistenceService.saveNotification(payload);
    } catch (e) {
    }
    this.refreshNotifications();
  }


  async removeNotification(id: string) {
    await this.persistenceService.deleteNotification(id);
    this.refreshNotifications();
  }

  getNotifications() {
    return this.notifications$.asObservable();
  }

  async enableNotifications() {
    if (!this.msg) return;
    const serviceWorkerRegistration = await navigator.serviceWorker
      .register('/combined-sw.js', {
        type: 'module',
      });

    const notificationPermissions = await Notification.requestPermission();
    if (notificationPermissions === 'denied') {
      throw new Error("Notification permissions are denied")
    }
    const fcmToken = await getToken(this.msg, {serviceWorkerRegistration});
    this.userApi.registerDevice({body: {fcmToken}}).subscribe();
    return true;
  }

  private async refreshNotifications() {
    try {
      const notifications = await this.persistenceService.getAllNotifications();
      notifications.reverse();
      this.notifications$.next(notifications);
    } catch (error) {
      console.error('Error refreshing notification-page', error);
    }
  }
}
