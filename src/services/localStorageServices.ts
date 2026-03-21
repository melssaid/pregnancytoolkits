/**
 * Local Storage Services - Simple replacement for Supabase services
 * Data is stored locally on device
 */

// Get or create user ID
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
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveData = <T>(key: string, data: T[]) => {
  localStorage.setItem(getKey(key), JSON.stringify(data));
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ==================== USER PROFILE ====================
export const UserProfileService = {
  async get() {
    const stored = localStorage.getItem(getKey('profile'));
    return stored ? JSON.parse(stored) : null;
  },

  async upsert(profile: any) {
    const data = { ...profile, user_id: getUserId(), updated_at: new Date().toISOString() };
    localStorage.setItem(getKey('profile'), JSON.stringify(data));
    return data;
  },

  async updateWeek(week: number) {
    const existing = await this.get() || {};
    return this.upsert({ ...existing, pregnancy_week: week });
  }
};

// ==================== BUMP PHOTOS ====================
export const BumpPhotoService = {
  async upload(file: File, week: number, caption?: string) {
    // Convert file to base64 for local storage
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const photo = {
      id: generateId(),
      user_id: getUserId(),
      week,
      image_ref: base64,
      storage_path: `local/${week}_${Date.now()}`,
      caption: caption || null,
      ai_analysis: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const photos = loadData<typeof photo>('bump_photos');
    photos.push(photo);
    saveData('bump_photos', photos);
    return photo;
  },

  async getAll() {
    return loadData<any>('bump_photos').sort((a, b) => a.week - b.week);
  },

  async getByWeek(week: number) {
    const photos = loadData<any>('bump_photos');
    return photos.find((p: any) => p.week === week) || null;
  },

  async delete(id: string, _storagePath: string) {
    const photos = loadData<any>('bump_photos').filter((p: any) => p.id !== id);
    saveData('bump_photos', photos);
  },

  async updateAnalysis(id: string, aiAnalysis: string) {
    const photos = loadData<any>('bump_photos').map((p: any) =>
      p.id === id ? { ...p, ai_analysis: aiAnalysis, updated_at: new Date().toISOString() } : p
    );
    saveData('bump_photos', photos);
  },

  async updateCaption(id: string, caption: string) {
    const photos = loadData<any>('bump_photos').map((p: any) =>
      p.id === id ? { ...p, caption, updated_at: new Date().toISOString() } : p
    );
    saveData('bump_photos', photos);
  }
};

// ==================== VITAMIN TRACKER ====================
export const VitaminService = {
  async log(vitaminName: string, dosage?: string, week?: number) {
    const log = {
      id: generateId(),
      user_id: getUserId(),
      vitamin_name: vitaminName,
      dosage: dosage || null,
      week: week || null,
      taken_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    const logs = loadData<typeof log>('vitamin_logs');
    logs.push(log);
    saveData('vitamin_logs', logs);
    window.dispatchEvent(new Event('storage'));
    return log;
  },

  async getTodayLogs() {
    const today = new Date().toISOString().split('T')[0];
    return loadData<any>('vitamin_logs').filter((l: any) => l.taken_at.startsWith(today));
  },

  async getHistory(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return loadData<any>('vitamin_logs')
      .filter((l: any) => new Date(l.taken_at) >= cutoff)
      .sort((a: any, b: any) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());
  },

  async deleteLog(id: string) {
    const logs = loadData<any>('vitamin_logs').filter((l: any) => l.id !== id);
    saveData('vitamin_logs', logs);
  }
};

// ==================== KICK COUNTER ====================
export const KickService = {
  async startSession(week: number) {
    const session = {
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
    const sessions = loadData<typeof session>('kick_sessions');
    sessions.push(session);
    saveData('kick_sessions', sessions);
    return session;
  },

  async addKick(sessionId: string, currentKicks: any[], timestamp: string) {
    const newKicks = [...currentKicks, { time: timestamp }];
    const sessions = loadData<any>('kick_sessions').map((s: any) =>
      s.id === sessionId ? { ...s, kicks: newKicks, total_kicks: newKicks.length } : s
    );
    saveData('kick_sessions', sessions);
    return newKicks;
  },

  async endSession(sessionId: string, durationMinutes: number, notes?: string) {
    const sessions = loadData<any>('kick_sessions').map((s: any) =>
      s.id === sessionId
        ? { ...s, ended_at: new Date().toISOString(), duration_minutes: durationMinutes, notes: notes || null }
        : s
    );
    saveData('kick_sessions', sessions);
  },

  async getActiveSession() {
    const sessions = loadData<any>('kick_sessions');
    return sessions.find((s: any) => !s.ended_at) || null;
  },

  async getHistory(limit = 10) {
    return loadData<any>('kick_sessions')
      .filter((s: any) => s.ended_at)
      .sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, limit);
  },

  async getTodaySessions() {
    const today = new Date().toISOString().split('T')[0];
    return loadData<any>('kick_sessions')
      .filter((s: any) => s.ended_at && s.started_at.startsWith(today));
  }
};

// ==================== AI SERVICE (Stub) ====================
export const AIService = {
  async analyzeBumpProgress(week: number, previousWeek?: number) {
    // Return a helpful message since we don't have real AI
    const content = previousWeek
      ? `In week ${week}, your baby continues to grow! Since week ${previousWeek}, your bump has grown normally. Remember to keep your skin moisturized and follow up with your doctor. 💕`
      : `You are in week ${week} of pregnancy! At this stage, your bump size is proportional to fetal growth. Continue following up with your doctor. 💕`;
    return { content, sources: [], cached: false };
  },

  async analyzeKickPatterns(sessions: any[], week: number) {
    const avgKicks = sessions.reduce((sum: number, s: any) => sum + (s.total_kicks || 0), 0) / sessions.length;
    const content = `In week ${week}, you recorded an average of ${avgKicks.toFixed(1)} movements per session. This is a good pattern! 10 movements within 2 hours is considered normal. Consult your doctor if you notice any significant changes. 👶`;
    return { content, sources: [], cached: false };
  }
};
