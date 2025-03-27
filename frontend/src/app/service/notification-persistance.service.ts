import { Injectable } from '@angular/core';
import { MessagePayload } from '@angular/fire/messaging'; // Import MessagePayload from FCM

@Injectable({ providedIn: 'root' })
export class NotificationPersistenceService {
  private dbName = 'notificationsDB';
  private storeName = 'notifications';

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'messageId' });
        }
      };

      request.onsuccess = (event) => resolve((event.target as IDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  saveNotification(payload: MessagePayload): Promise<void> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((db) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(payload);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(event);
          reject((event.target as IDBRequest).error)
        };
      }).catch(reject);
    });
  }

  deleteNotification(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((db) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject((event.target as IDBRequest).error);
      }).catch(reject);
    });
  }

  getAllNotifications(): Promise<MessagePayload[]> {
    return new Promise((resolve, reject) => {
      this.openDatabase().then((db) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject((event.target as IDBRequest).error);
      }).catch(reject);
    });
  }
}
