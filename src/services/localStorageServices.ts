/* src/services/localStorageServices.ts
   Typed local storage services to satisfy @typescript-eslint/no-explicit-any
*/

type ID = string;

interface UserProfile {
  user_id: string;
  pregnancy_week?: number | null;
  updated_at?: string;
  [k: string]: unknown;
}

interface BumpPhoto {
  id: ID;
  user_id: string;
  week: number;
  image_ref: string;
  storage_path: string;
  caption: string | null;
  ai_analysis: string | null;
  created_at: string;
  updated_at: string;
}

interface VitaminLog {
  id: ID;
  user_id: string;
  vitamin_name: string;
  dosage: string | null;
  week: number | null;
  taken_at: string;
  created_at: string;
}

interface Kick {
  time: string;
}

interface KickSession {
  id: ID;
  user_id: string;
  week: number;
  kicks: Kick[];
  total_kicks: number;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

// Helper types
const getUserId = (): string => {
  let userId = localStorage.getItem('pregnancy_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pregnancy_user_id', userId);
  }
  return userId;
};

const getKey = (name: string) => `${name}_${getUserId()}`;

const loadData = <T>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(getKey(key));
    if (!stored) return [];
    return JSON.parse(stored) as T[];
  } catch {
    return [];
  }
};

const saveData = <T>(key: string, data: T[]) => {
  localStorage.setItem(getKey(key), JSON.stringify(data));
};

const generateId = (): ID => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ==================== USER PROFILE ====================
export const UserProfileService = {
  async get(): Promise<UserProfile | null> {
    const stored = localStorage.getItem(getKey('profile'));
    return stored ? (JSON.parse(stored) as UserProfile) : null;
  },

  async upsert(profile: Partial<UserProfile>): Promise<UserProfile> {
    const data: UserProfile = {
      ...(profile as UserProfile),
      user_id: getUserId(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(getKey('profile'), JSON.stringify(data));
    return data;
  },

  async updateWeek(week: number): Promise<UserProfile> {
    const existing = (await this.get()) || {};
    return this.upsert({ ...existing, pregnancy_week: week });
  }
};

// ==================== BUMP PHOTOS ====================
export const BumpPhotoService = {
  async upload(file: File, week: number, caption?: string): Promise<BumpPhoto> {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    const photo: BumpPhoto = {
      id: generateId(),
      user_id: getUserId(),
      week,
      image_ref: base64,
      storage_path: `local/${week}_${Date.now()}`,
      caption: caption ?? null,
      ai_analysis: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const photos = loadData<BumpPhoto>('bump_photos');
    photos.push(photo);
    const trimmed = photos.length > 42 ? photos.slice(-42) : photos;
    saveData('bump_photos', trimmed);
    return photo;
  },

  async getAll(): Promise<BumpPhoto[]> {
    return loadData<BumpPhoto>('bump_photos').sort((a, b) => a.week - b.week);
  },

  async getByWeek(week: number): Promise<BumpPhoto | null> {
    const photos = loadData<BumpPhoto>('bump_photos');
    return photos.find((p) => p.week === week) || null;
  },

  async delete(id: string, _storagePath: string): Promise<void> {
    const photos = loadData<BumpPhoto>('bump_photos').filter((p) => p.id !== id);
    saveData('bump_photos', photos);
  },

  async updateAnalysis(id: string, aiAnalysis: string): Promise<void> {
    const photos = loadData<BumpPhoto>('bump_photos').map((p) =>
      p.id === id ? { ...p, ai_analysis: aiAnalysis, updated_at: new Date().toISOString() } : p
    );
    saveData('bump_photos', photos);
  },

  async updateCaption(id: string, caption: string): Promise<void> {
    const photos = loadData<BumpPhoto>('bump_photos').map((p) =>
      p.id === id ? { ...p, caption, updated_at: new Date().toISOString() } : p
    );
    saveData('bump_photos', photos);
  }
};

// ==================== VITAMIN TRACKER ====================
export const VitaminService = {
  async log(vitaminName: string, dosage?: string, week?: number): Promise<VitaminLog> {
    const log: VitaminLog = {
      id: generateId(),
      user_id: getUserId(),
      vitamin_name: vitaminName,
      dosage: dosage ?? null,
      week: week ?? null,
      taken_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    const logs = loadData<VitaminLog>('vitamin_logs');
    logs.push(log);
    const trimmed = logs.length > 200 ? logs.slice(-200) : logs;
    saveData('vitamin_logs', trimmed);
    window.dispatchEvent(new Event('storage'));
    return log;
  },

  async getTodayLogs(): Promise<VitaminLog[]> {
    const today = new Date().toISOString().split('T')[0];
    return loadData<VitaminLog>('vitamin_logs').filter((l) => l.taken_at.startsWith(today));
  },

  async getHistory(days = 7): Promise<VitaminLog[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return loadData<VitaminLog>('vitamin_logs')
      .filter((l) => new Date(l.taken_at) >= cutoff)
      .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());
  },

  async deleteLog(id: string): Promise<void> {
    const logs = loadData<VitaminLog>('vitamin_logs').filter((l) => l.id !== id);
    saveData('vitamin_logs', logs);
  }
};

// ==================== KICK COUNTER ====================
export const KickService = {
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
    const trimmed = sessions.length > 100 ? sessions.slice(-100) : sessions;
    saveData('kick_sessions', trimmed);
    return session;
  },

  async addKick(sessionId: string, currentKicks: Kick[], timestamp: string): Promise<Kick[]> {
    const newKicks = [...currentKicks, { time: timestamp }];
    const sessions = loadData<KickSession>('kick_sessions').map((s) =>
      s.id === sessionId ? { ...s, kicks: newKicks, total_kicks: newKicks.length } : s
    );
    saveData('kick_sessions', sessions);
    return newKicks;
  },

  async endSession(sessionId: string, durationMinutes: number, notes?: string): Promise<void> {
    const sessions = loadData<KickSession>('kick_sessions').map((s) =>
      s.id === sessionId
        ? { ...s, ended_at: new Date().toISOString(), duration_minutes: durationMinutes, notes: notes ?? null }
        : s
    );
    saveData('kick_sessions', sessions);
  },

  async getActiveSession(): Promise<KickSession | null> {
    const sessions = loadData<KickSession>('kick_sessions');
    return sessions.find((s) => !s.ended_at) || null;
  },

  async getHistory(limit = 10): Promise<KickSession[]> {
    return loadData<KickSession>('kick_sessions')
      .filter((s) => s.ended_at)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, limit);
  },

  async getTodaySessions(): Promise<KickSession[]> {
    const today = new Date().toISOString().split('T')[0];
    return loadData<KickSession>('kick_sessions').filter((s) => s.ended_at && s.started_at.startsWith(today));
  }
};

// ==================== AI SERVICE (Stub) ====================
export const AIService = {
  async analyzeBumpProgress(week: number, previousWeek?: number) {
    const content = previousWeek
      ? `In week ${week}, your baby continues to grow! Since week ${previousWeek}, your bump has grown normally. Remember to keep your skin moisturized and follow up with your doctor. 💕`
      : `You are in week ${week} of pregnancy! At this stage, your bump size is proportional to fetal growth. Continue following up with your doctor. 💕`;
    return { content, sources: [], cached: false };
  },

  async analyzeKickPatterns(sessions: KickSession[], week: number) {
    if (!sessions.length) {
      return { content: `No kick sessions recorded for week ${week}.`, sources: [], cached: false };
    }
    const avgKicks =
      sessions.reduce((sum, s) => sum + (s.total_kicks || 0), 0) / Math.max(1, sessions.length);
    const content = `In week ${week}, you recorded an average of ${avgKicks.toFixed(1)} movements per session. This is a good pattern!`;
    return { content, sources: [], cached: false };
  }
};
