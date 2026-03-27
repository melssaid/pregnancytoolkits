// src/services/localStorageServices.ts
export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`saveToLocalStorage failed for key=${key}`, err);
  }
}

export function loadFromLocalStorage<T = unknown>(key: string): T | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`loadFromLocalStorage failed for key=${key}`, err);
    return null;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`removeFromLocalStorage failed for key=${key}`, err);
  }
}
