import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  icon: string;
  description: string;
  link?: string;
}

@Injectable({providedIn: 'root'})
export class NotificationService {
  private notifications: Notification[] = [];
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  addNotification(notification: Omit<Notification, 'id'>) {
    const newNotification = {...notification, id: this.generateId()};
    this.notifications.push(newNotification);
    this.notifications$.next([...this.notifications]);
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifications$.next([...this.notifications]);
  }

  getNotifications() {
    return this.notifications$.asObservable();
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
