/**
 * General-purpose IndexedDB Store
 * Replaces localStorage for large datasets with automatic fallback
 */

const DB_NAME = 'pt-store';
const DB_VERSION = 1;
const STORE_NAME = 'data';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    } catch (e) {
      dbPromise = null;
      reject(e);
    }
  });
  
  return dbPromise;
}

export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => {
        // Fallback to localStorage
        try {
          const raw = localStorage.getItem(key);
          resolve(raw ? JSON.parse(raw) : null);
        } catch { resolve(null); }
      };
    });
  } catch {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

export async function idbSet(key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        // Fallback to localStorage
        try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
        resolve();
      };
    });
  } catch {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
  }
}

export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch { }
  try { localStorage.removeItem(key); } catch { }
}

/**
 * Migrate a key from localStorage to IndexedDB (one-time)
 */
export async function migrateFromLocalStorage(key: string): Promise<void> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw);
    await idbSet(key, data);
    // Keep localStorage copy as backup — don't delete
  } catch { }
}

/**
 * Cleanup entries older than maxAgeMs
 */
export async function idbCleanup(keyPrefix: string, maxAgeMs: number = 365 * 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();
    req.onsuccess = () => {
      const keys = req.result as string[];
      keys.filter(k => typeof k === 'string' && k.startsWith(keyPrefix)).forEach(k => {
        const getReq = store.get(k);
        getReq.onsuccess = () => {
          const val = getReq.result;
          if (val?.createdAt || val?.timestamp) {
            const ts = new Date(val.createdAt || val.timestamp).getTime();
            if (Date.now() - ts > maxAgeMs) {
              store.delete(k);
            }
          }
        };
      });
    };
  } catch { }
}
