import {Injectable} from '@angular/core';
import {KeyService} from './key.service';

const DB_NAME = 'PIPSER';
const OWN_KEY_STORE = 'OWN_KEY_STORE';
const CONTACTS_STORE = 'CONTACTS_STORE';

@Injectable({providedIn: 'root'})
export class ContactService {

  constructor(private keyService: KeyService) {
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(OWN_KEY_STORE)) {
          db.createObjectStore(OWN_KEY_STORE);
        }
        if (!db.objectStoreNames.contains(CONTACTS_STORE)) {
          db.createObjectStore(CONTACTS_STORE, {keyPath: 'alias'});
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getOwnKey(): Promise<CryptoKeyPair | null> {
    const db = await this.openDB();
    const tx = db.transaction(OWN_KEY_STORE, 'readonly');
    const store = tx.objectStore(OWN_KEY_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get('ownKey');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async setOwnKey(keyPair: CryptoKeyPair): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(OWN_KEY_STORE, 'readwrite');
    const store = tx.objectStore(OWN_KEY_STORE);
    return new Promise((resolve, reject) => {
      const request = store.put(keyPair, 'ownKey');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addContact(alias: string, publicKey: string): Promise<void> {
    const db = await this.openDB();
    const key = await this.keyService.generateHash(publicKey);
    const tx = db.transaction(CONTACTS_STORE, 'readwrite');
    const store = tx.objectStore(CONTACTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.add({key, alias, publicKey});
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async removeContact(alias: string): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(CONTACTS_STORE, 'readwrite');
    const store = tx.objectStore(CONTACTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.delete(alias);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getContacts(): Promise<{ alias: string; publicKey: string }[]> {
    const db = await this.openDB();
    const tx = db.transaction(CONTACTS_STORE, 'readonly');
    const store = tx.objectStore(CONTACTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getContact(alias: string): Promise<{ alias: string; publicKey: CryptoKey } | null> {
    const db = await this.openDB();
    const tx = db.transaction(CONTACTS_STORE, 'readonly');
    const store = tx.objectStore(CONTACTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get(alias);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
}
