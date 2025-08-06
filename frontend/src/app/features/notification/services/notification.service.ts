import {ActionPerformed, PushNotifications, PushNotificationSchema, Token} from '@capacitor/push-notifications';
import {BehaviorSubject} from 'rxjs';
import {ApiUserService} from '../../../api/services/api-user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Capacitor} from '@capacitor/core';
import {ERROR_SNACKBAR} from '../../../util/snackbar-consts';
import {URLS} from '../../../app.routes';


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
  private notifications$ = new BehaviorSubject<PushNotificationSchema[]>([]);

  constructor(
    private userApi: ApiUserService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
  }


  async addNotification(notification: PushNotificationSchema) {
    this.notifications$.next([...this.notifications$.value, notification]);
  }


  async removeNotification(id: string) {
    this.notifications$.next(this.notifications$.value.filter(n => n.id !== id));
  }

  getNotifications() {
    return this.notifications$.asObservable();
  }

  async enableNotifications() {
    const isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications');
    if (!isPushNotificationsAvailable) {
      console.log('PushNotifications not available');
      return false;
    }
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        this.snackBar.open('Push notification permissions denied!', 'Ok', ERROR_SNACKBAR);
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      this.snackBar.open('Push token retrieved', 'Ok', {duration: 1000});
      this.userApi.registerDevice({body: {fcmToken: token.value}}).subscribe(() => {
      });
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      this.snackBar.open('Failed to register!' + error, 'Ok', ERROR_SNACKBAR);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.addNotification(notification);
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        if (notification.notification.data['type'] === NotificationType.NEW_POST) {
          this.router.navigateByUrl(URLS.VIEW_POST_FN(notification.notification.data['post_id']));
        }
        if (notification.notification.data['type'] === NotificationType.LIKE_POST) {
          this.router.navigateByUrl(URLS.VIEW_POST_FN(notification.notification.data['post_id']));
        }
        if (notification.notification.data['type'] === NotificationType) {
          this.router.navigateByUrl(URLS.ACCEPT_CONNECTION_FN(notification.notification.data['fingerprint']));
        }
        this.addNotification(notification.notification);
      },
    );
    return true;
  }
}
