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

  async delete(id: string): Promise<void> {
    const photos = loadData<BumpPhoto>('bump_photos').filter(p => p.id !== id);
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
  }
};
