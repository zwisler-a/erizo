export class IndexedDBStore {
  private dbName: string;
  private storeName: string;
  private defaultTtlMs: number;
  private maxBytes: number;
  private dbPromise: Promise<IDBDatabase>;

  constructor(dbName: string, storeName: string, defaultTtlMs: number = 3600000, maxBytes: number = 512 * 1024 * 1024) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.defaultTtlMs = defaultTtlMs;
    this.maxBytes = maxBytes;
    this.dbPromise = this.openDB();
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async withStore<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.dbPromise;
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(this.storeName, mode);
      const store = tx.objectStore(this.storeName);
      const request = callback(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private getSize(obj: any): number {
    return new TextEncoder().encode(JSON.stringify(obj)).length;
  }

  async set(key: number, value: any, ttlMs?: number): Promise<void> {
    await this.cleanupExpired();
    const record = {value, expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs), createdAt: Date.now()};
    await this.ensureFits(record);
    await this.withStore('readwrite', store => store.put(record, key));
  }

  async get<T>(key: number): Promise<T | undefined> {
    const record = await this.withStore<{
      value: T;
      expiresAt: number
    } | undefined>('readonly', store => store.get(key));
    if (!record) return undefined;
    if (Date.now() > record.expiresAt) {
      await this.delete(key);
      return undefined;
    }
    return record.value;
  }

  async has(key: number): Promise<boolean> {
    return !!(await this.get(key));
  }

  async delete(key: number): Promise<void> {
    await this.withStore('readwrite', store => store.delete(key));
  }

  async clear(): Promise<void> {
    await this.withStore('readwrite', store => store.clear());
  }

  async keys(): Promise<number[]> {
    return this.withStore('readonly', store => store.getAllKeys()) as Promise<number[]>;
  }

  async cleanupExpired(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    const request = store.openCursor();
    const now = Date.now();

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      const record = cursor.value;
      if (record?.expiresAt && now > record.expiresAt) {
        cursor.delete();
      }
      cursor.continue();
    };
  }

  private async ensureFits(newRecord: any): Promise<void> {
    const newSize = this.getSize(newRecord);
    const entries = await this.withStore<any[]>('readonly', store => store.getAll());

    const itemsWithSize = entries.map((entry, i) => ({
      key: i,
      size: this.getSize(entry),
      createdAt: entry.createdAt
    }));

    let totalSize = itemsWithSize.reduce((acc, item) => acc + item.size, 0);

    if (totalSize + newSize <= this.maxBytes) return;

    itemsWithSize.sort((a, b) => b.createdAt - a.createdAt);

    const db = await this.dbPromise;
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    for (const item of itemsWithSize) {
      console.log('clearing');
      await new Promise<void>((resolve, reject) => {
        const deleteReq = store.delete(item.key);
        deleteReq.onsuccess = () => {
          totalSize -= item.size;
          resolve();
        };
        deleteReq.onerror = () => reject(deleteReq.error);
      });

      if (totalSize + newSize <= this.maxBytes) break;
    }
  }
}

export async function filterAsync<T>(arr: T[], asyncCondition: (item: T) => Promise<boolean>) {
  const results = await Promise.all(arr.map(async item => {
    return await asyncCondition(item);
  }));
  return arr.filter((_, index) => results[index]);
}
