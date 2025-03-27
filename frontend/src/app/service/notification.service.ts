import { Injectable } from '@angular/core';
import { BehaviorSubject, concat, Observable } from 'rxjs';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { ApiUserService } from '../api/services/api-user.service';
import { MessagePayload } from '@angular/fire/messaging';
import { NotificationPersistenceService } from './notification-persistance.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new BehaviorSubject<MessagePayload[]>([]);
  private fcmMessages$ = concat(
    this.getAllBackgroundNotifications(),
    new Observable<MessagePayload>((sub) => onMessage(this.msg, (msg) => sub.next(msg))),
  );

  constructor(
    private msg: Messaging,
    private userApi: ApiUserService,
    private persistenceService: NotificationPersistenceService,
  ) {
    this.fcmMessages$.subscribe((msg) => {
      this.addNotification(msg);
    });
    this.refreshNotifications();
  }

  async addNotification(payload: MessagePayload) {
    try {
      await this.persistenceService.saveNotification(payload);
    } catch (e) {
      console.error(e);
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
    const serviceWorkerRegistration = await navigator.serviceWorker
      .register('/firebase-messaging-sw.js', {
        type: 'module',
      });

    const notificationPermissions = await Notification.requestPermission();
    if (notificationPermissions === 'denied') {
      return false;
    }
    const fcmToken = await getToken(this.msg, { serviceWorkerRegistration });
    this.userApi.registerDevice({ body: { fcmToken } }).subscribe();
    return true;
  }

  private getAllBackgroundNotifications(): Observable<MessagePayload> {
    return new Observable((observer) => {
      this.persistenceService.getAllNotifications().then(notifications => {
        notifications.forEach((notification) => observer.next(notification));
      }).finally(() => observer.complete());
    });
  }

  private async refreshNotifications() {
    try {
      const notifications = await this.persistenceService.getAllNotifications();
      this.notifications$.next(notifications);
    } catch (error) {
      console.error('Error refreshing notification-page', error);
    }
  }
}
