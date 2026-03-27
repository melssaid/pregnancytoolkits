/* src/services/localStorageServices.ts
   Typed local storage replacement for Supabase services
*/

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
  localStorage.setItem(getKey(key), JSON.stringify(data));
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
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    const now = new Date().toISOString();
    const photo: BumpPhoto = {
      id: generateId(),
      user_id: getUserId(),
      week,
      image_ref: base64,
      storage_path: `local/${generateId()}`,
      caption: caption || null,
      ai_analysis: null,
      created_at: now,
      updated_at: now
    };

    const photos = loadData<BumpPhoto>('bump_photos');
    photos.push(photo);
    saveData('bump_photos', photos);
    return photo;
  },

  async getByWeek(week: number): Promise<BumpPhoto[]> {
    return loadData<BumpPhoto>('bump_photos').filter(p => p.week === week);
  },

  async getAll(): Promise<BumpPhoto[]> {
    return loadData<BumpPhoto>('bump_photos');
  },

  async delete(id: string, _storagePath?: string): Promise<void> {
    const photos = loadData<BumpPhoto>('bump_photos').filter(p => p.id !== id);
    saveData('bump_photos', photos);
  },

  async updateCaption(id: string, caption: string): Promise<void> {
    const photos = loadData<BumpPhoto>('bump_photos').map(p =>
      p.id === id ? { ...p, caption, updated_at: new Date().toISOString() } : p
    );
    saveData('bump_photos', photos);
  },

  async updateAnalysis(id: string, analysis: string): Promise<void> {
    const photos = loadData<BumpPhoto>('bump_photos').map(p =>
      p.id === id ? { ...p, ai_analysis: analysis, updated_at: new Date().toISOString() } : p
    );
    saveData('bump_photos', photos);
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