/* src/services/localStorageServices.ts
   Typed local storage replacement for Supabase services
*/

import { emitDataChange } from "@/lib/dataBus";

const getUserId = (): string => {
  let userId = localStorage.getItem('pregnancy_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('pregnancy_user_id', userId);
  }
  return userId;
};

const getKey = (name: string) => `${name}_${getUserId()}`;

const loadData = <T>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(getKey(key));
    return stored ? (JSON.parse(stored) as T[]) : [];
  } catch {
    return [];
  }
};

const saveData = <T>(key: string, data: T[]) => {
  const fullKey = getKey(key);
  localStorage.setItem(fullKey, JSON.stringify(data));
  // Also notify subscribers using the canonical (non-suffixed) key for
  // cross-component compatibility (dashboard reads multiple key shapes).
  emitDataChange(fullKey);
  emitDataChange(key);
};

const generateId = (): string => `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

/* Types */
export interface Profile {
  user_id: string;
  pregnancy_week?: number | null;
  updated_at?: string;
  [key: string]: unknown;
}

export interface BumpPhoto {
  id: string;
  user_id: string;
  week: number;
  image_ref: string;
  storage_path: string;
  caption: string | null;
  ai_analysis: string | null;
  created_at: string;
  updated_at: string;
}

export interface VitaminLog {
  id: string;
  user_id: string;
  vitamin_name: string;
  dosage: string | null;
  week: number | null;
  taken_at: string;
  created_at: string;
}

export interface Kick {
  time: string;
}

export interface KickSession {
  id: string;
  user_id: string;
  week: number;
  kicks: Kick[];
  total_kicks: number;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

/* Services */
export const UserProfileService = {
  async get(): Promise<Profile | null> {
    const stored = localStorage.getItem(getKey('profile'));
    return stored ? (JSON.parse(stored) as Profile) : null;
  },

  async upsert(profile: Partial<Profile>): Promise<Profile> {
    const data: Profile = {
      ...(profile as Profile),
      user_id: getUserId(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(getKey('profile'), JSON.stringify(data));
    return data;
  },

  async updateWeek(week: number): Promise<Profile> {
    const existing = (await this.get()) || {};
    return this.upsert({ ...existing, pregnancy_week: week });
  }
};

export const BumpPhotoService = {
  async upload(file: File, week: number, caption?: string): Promise<BumpPhoto> {
    const {
      savePhotoToDB,
      fileToBlob,
      createPhotoURL,
    } = await import('@/lib/indexedDBPhotos');

    const now = new Date().toISOString();
    const id = generateId();
    const userId = getUserId();

    try {
      // Compress and store blob in IndexedDB (hundreds of MB capacity)
      const blob = await fileToBlob(file);
      await savePhotoToDB({
        id,
        user_id: userId,
        week,
        image_blob: blob,
        caption: caption || null,
        ai_analysis: null,
        created_at: now,
        updated_at: now,
      });

      // Create a temporary object URL for immediate display
      const objectUrl = createPhotoURL({ image_blob: blob } as any);

      const photo: BumpPhoto = {
        id,
        user_id: userId,
        week,
        image_ref: objectUrl,
        storage_path: `indexeddb/${id}`,
        caption: caption || null,
        ai_analysis: null,
        created_at: now,
        updated_at: now,
      };

      // Store lightweight metadata in localStorage (no base64)
      const metas = loadData<BumpPhoto>('bump_photos_meta');
      metas.push({ ...photo, image_ref: `idb://${id}` });
      saveData('bump_photos_meta', metas);

      return photo;
    } catch {
      // Fallback to localStorage base64 if IndexedDB fails
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const photo: BumpPhoto = {
        id,
        user_id: userId,
        week,
        image_ref: base64,
        storage_path: `local/${id}`,
        caption: caption || null,
        ai_analysis: null,
        created_at: now,
        updated_at: now,
      };

      const photos = loadData<BumpPhoto>('bump_photos');
      photos.push(photo);
      saveData('bump_photos', photos);
      return photo;
    }
  },

  async getByWeek(week: number): Promise<BumpPhoto[]> {
    const all = await this.getAll();
    return all.filter(p => p.week === week);
  },

  async getAll(): Promise<BumpPhoto[]> {
    try {
      const { getPhotosFromDB, createPhotoURL } = await import('@/lib/indexedDBPhotos');
      const userId = getUserId();
      const idbPhotos = await getPhotosFromDB(userId);

      if (idbPhotos.length > 0) {
        return idbPhotos.map(p => ({
          id: p.id,
          user_id: p.user_id,
          week: p.week,
          image_ref: createPhotoURL(p),
          storage_path: `indexeddb/${p.id}`,
          caption: p.caption,
          ai_analysis: p.ai_analysis,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
      }
    } catch {
      // IndexedDB unavailable, fall through to localStorage
    }

    // Legacy localStorage fallback
    return loadData<BumpPhoto>('bump_photos');
  },

  async delete(id: string, _storagePath?: string): Promise<void> {
    try {
      const { deletePhotoFromDB } = await import('@/lib/indexedDBPhotos');
      await deletePhotoFromDB(id);
    } catch { /* ignore */ }

    // Also clean from metadata and legacy stores
    const metas = loadData<BumpPhoto>('bump_photos_meta').filter(p => p.id !== id);
    saveData('bump_photos_meta', metas);
    const photos = loadData<BumpPhoto>('bump_photos').filter(p => p.id !== id);
    saveData('bump_photos', photos);
  },

  async updateCaption(id: string, caption: string): Promise<void> {
    try {
      const { updatePhotoInDB } = await import('@/lib/indexedDBPhotos');
      await updatePhotoInDB(id, { caption });
    } catch { /* ignore */ }

    const metas = loadData<BumpPhoto>('bump_photos_meta').map(p =>
      p.id === id ? { ...p, caption, updated_at: new Date().toISOString() } : p
    );
    saveData('bump_photos_meta', metas);
  },

  async updateAnalysis(id: string, analysis: string): Promise<void> {
    try {
      const { updatePhotoInDB } = await import('@/lib/indexedDBPhotos');
      await updatePhotoInDB(id, { ai_analysis: analysis });
    } catch { /* ignore */ }

    const metas = loadData<BumpPhoto>('bump_photos_meta').map(p =>
      p.id === id ? { ...p, ai_analysis: analysis, updated_at: new Date().toISOString() } : p
    );
    saveData('bump_photos_meta', metas);
  }
};

export const VitaminLogService = {
  async log(entry: Omit<VitaminLog, 'id' | 'user_id' | 'created_at'>): Promise<VitaminLog> {
    const log: VitaminLog = {
      ...entry,
      id: generateId(),
      user_id: getUserId(),
      created_at: new Date().toISOString()
    };
    const logs = loadData<VitaminLog>('vitamin_logs');
    logs.push(log);
    saveData('vitamin_logs', logs);
    return log;
  },

  async getAll(): Promise<VitaminLog[]> {
    return loadData<VitaminLog>('vitamin_logs');
  }
};

export const KickSessionService = {
  async save(session: Omit<KickSession, 'id' | 'user_id'>): Promise<KickSession> {
    const entry: KickSession = {
      ...session,
      id: generateId(),
      user_id: getUserId()
    };
    const sessions = loadData<KickSession>('kick_sessions');
    sessions.push(entry);
    saveData('kick_sessions', sessions);
    return entry;
  },

  async getAll(): Promise<KickSession[]> {
    return loadData<KickSession>('kick_sessions');
  },

  async getActiveSession(): Promise<KickSession | null> {
    const sessions = loadData<KickSession>('kick_sessions');
    return sessions.find(s => !s.ended_at) || null;
  },

  async getHistory(limit = 10): Promise<KickSession[]> {
    const sessions = loadData<KickSession>('kick_sessions')
      .filter(s => s.ended_at)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    return sessions.slice(0, limit);
  },

  async startSession(week: number): Promise<KickSession> {
    const session: KickSession = {
      id: generateId(),
      user_id: getUserId(),
      week,
      kicks: [],
      total_kicks: 0,
      started_at: new Date().toISOString(),
      ended_at: null,
      duration_minutes: null,
      notes: null
    };
    const sessions = loadData<KickSession>('kick_sessions');
    sessions.push(session);
    saveData('kick_sessions', sessions);
    return session;
  },

  async addKick(sessionId: string, currentKicks: Kick[], timestamp: string): Promise<Kick[]> {
    const sessions = loadData<KickSession>('kick_sessions');
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return currentKicks;
    const newKick: Kick = { time: timestamp };
    const updatedKicks = [...currentKicks, newKick];
    sessions[idx].kicks = updatedKicks;
    sessions[idx].total_kicks = updatedKicks.length;
    saveData('kick_sessions', sessions);
    return updatedKicks;
  },

  async endSession(sessionId: string, durationMinutes: number, notes?: string): Promise<void> {
    const sessions = loadData<KickSession>('kick_sessions');
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return;
    sessions[idx].ended_at = new Date().toISOString();
    sessions[idx].duration_minutes = durationMinutes;
    sessions[idx].notes = notes || null;
    saveData('kick_sessions', sessions);
  }
};

export const KickService = KickSessionService;

export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

export function saveToLocalStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function removeFromLocalStorage(key: string): void {
  localStorage.removeItem(key);
}