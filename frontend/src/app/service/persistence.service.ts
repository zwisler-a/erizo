import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class PersistenceService {
  private dbName = 'elerizo';
  private storeName = 'store';
  private db!: IDBDatabase;
  private doneInitializing!: () => void;
  private initialized = new Promise<void>(resolve => this.doneInitializing = resolve);

  constructor() {
    this.initDb();
  }

  private initDb(): void {
    const request = indexedDB.open(this.dbName, 1);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      if (!this.db.objectStoreNames.contains(this.storeName)) {
        this.db.createObjectStore(this.storeName);
      }

    };
    request.onsuccess = () => {
      this.db = request.result;
      this.doneInitializing();
    };
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
    };
  }

  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    await this.initialized;
    return this.db.transaction(this.storeName, mode).objectStore(this.storeName);
  }

  async setItem(key: string, value: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const request = (await this.getStore('readwrite')).put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getItem<T>(key: string): Promise<T | null> {
    return new Promise(async (resolve, reject) => {
      const request = (await this.getStore('readonly')).get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async removeItem(key: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const request = (await this.getStore('readwrite')).delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const request = (await this.getStore('readwrite')).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
