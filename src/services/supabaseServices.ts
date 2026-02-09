import { supabase } from '@/integrations/supabase/client';

// =====================================================
// HELPER FUNCTIONS
// =====================================================
const getUserId = (): string => {
  let userId = localStorage.getItem('pregnancy_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('pregnancy_user_id', userId);
  }
  return userId;
};

const getLocalData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateId = (): string => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
};

// Check if Supabase is properly configured
const isSupabaseConfigured = (): boolean => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    return !!(url && key && url.includes('supabase'));
  } catch {
    return false;
  }
};

// =====================================================
// USER PROFILE SERVICE (localStorage)
// =====================================================
export const UserProfileService = {
  async get() {
    const userId = getUserId();
    const profiles = getLocalData<any>('user_profiles');
    return profiles.find(p => p.user_id === userId) || null;
  },

  async upsert(profile: any) {
    const userId = getUserId();
    let profiles = getLocalData<any>('user_profiles');
    const index = profiles.findIndex(p => p.user_id === userId);
    
    const updatedProfile = {
      id: index >= 0 ? profiles[index].id : generateId(),
      user_id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    };
    
    if (index >= 0) {
      profiles[index] = updatedProfile;
    } else {
      profiles.push(updatedProfile);
    }
    
    setLocalData('user_profiles', profiles);
    return updatedProfile;
  }
};

// =====================================================
// VITAMIN SERVICE (localStorage)
// =====================================================
export const VitaminService = {
  async log(vitaminName: string, dosage: string, week: number) {
    const userId = getUserId();
    const logs = getLocalData<any>('vitamin_logs');
    
    const newLog = {
      id: generateId(),
      user_id: userId,
      vitamin_name: vitaminName,
      dosage: dosage,
      week: week,
      taken_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    logs.push(newLog);
    setLocalData('vitamin_logs', logs);
    return newLog;
  },

  async getTodayLogs() {
    const userId = getUserId();
    const logs = getLocalData<any>('vitamin_logs');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs
      .filter(log => 
        log.user_id === userId && 
        new Date(log.taken_at) >= today
      )
      .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());
  },

  async getHistory(days: number = 7) {
    const userId = getUserId();
    const logs = getLocalData<any>('vitamin_logs');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return logs
      .filter(log => 
        log.user_id === userId && 
        new Date(log.taken_at) >= startDate
      )
      .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());
  }
};

// =====================================================
// KICK COUNTER SERVICE (localStorage)
// =====================================================
export const KickService = {
  async startSession(week: number) {
    const userId = getUserId();
    const sessions = getLocalData<any>('kick_sessions');
    
    const newSession = {
      id: generateId(),
      user_id: userId,
      week: week,
      kicks: [],
      total_kicks: 0,
      started_at: new Date().toISOString(),
      ended_at: null,
      duration_minutes: null,
      notes: null
    };
    
    sessions.push(newSession);
    setLocalData('kick_sessions', sessions);
    return newSession;
  },

  async getActiveSession() {
    const userId = getUserId();
    const sessions = getLocalData<any>('kick_sessions');
    return sessions
      .filter(s => s.user_id === userId && !s.ended_at)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0] || null;
  },

  async addKick(sessionId: string, currentKicks: any[], timestamp: string) {
    const sessions = getLocalData<any>('kick_sessions');
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index >= 0) {
      const newKicks = [...currentKicks, { time: timestamp }];
      sessions[index].kicks = newKicks;
      sessions[index].total_kicks = newKicks.length;
      setLocalData('kick_sessions', sessions);
      return newKicks;
    }
    return currentKicks;
  },

  async endSession(sessionId: string, durationMinutes: number, notes?: string) {
    const sessions = getLocalData<any>('kick_sessions');
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index >= 0) {
      sessions[index].ended_at = new Date().toISOString();
      sessions[index].duration_minutes = durationMinutes;
      sessions[index].notes = notes || null;
      setLocalData('kick_sessions', sessions);
    }
  },

  async getHistory(limit: number = 10) {
    const userId = getUserId();
    const sessions = getLocalData<any>('kick_sessions');
    
    return sessions
      .filter(s => s.user_id === userId && s.ended_at)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, limit);
  }
};

// =====================================================
// BUMP PHOTO SERVICE (Supabase with localStorage fallback)
// =====================================================
export const BumpPhotoService = {
  async upload(file: File, week: number, caption?: string) {
    const userId = getUserId();
    
    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        const fileName = `${userId}/${week}_${Date.now()}.${file.name.split('.').pop()}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('bump-photos')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        // Generate a signed URL (1 hour expiry) instead of a public URL
        const { data: urlData, error: urlError } = await supabase.storage
          .from('bump-photos')
          .createSignedUrl(fileName, 3600);
        
        if (urlError) throw urlError;
        
        // Save to database - store path for on-demand URL generation
        const { data, error } = await supabase
          .from('bump_photos')
          .insert({
            user_id: userId,
            week: week,
            storage_path: fileName,
            public_url: urlData.signedUrl,
            caption: caption || null
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Supabase upload failed, using localStorage:', e);
      }
    }
    
    // Fallback to localStorage with base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const photos = getLocalData<any>('bump_photos');
        const newPhoto = {
          id: generateId(),
          user_id: userId,
          week: week,
          public_url: reader.result as string,
          storage_path: `local_${Date.now()}`,
          caption: caption || null,
          ai_analysis: null,
          created_at: new Date().toISOString()
        };
        photos.push(newPhoto);
        setLocalData('bump_photos', photos);
        resolve(newPhoto);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async getAll() {
    const userId = getUserId();
    
    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bump_photos')
          .select('*')
          .eq('user_id', userId)
          .order('week', { ascending: true });
        
        if (!error && data) {
          // Regenerate signed URLs for all photos (stored URLs may have expired)
          const photosWithFreshUrls = await Promise.all(
            data.map(async (photo) => {
              if (photo.storage_path && !photo.storage_path.startsWith('local_')) {
                try {
                  const { data: urlData, error: urlError } = await supabase.storage
                    .from('bump-photos')
                    .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry
                  if (!urlError && urlData) {
                    return { ...photo, public_url: urlData.signedUrl };
                  }
                } catch {
                  // Fall back to stored URL
                }
              }
              return photo;
            })
          );
          return photosWithFreshUrls;
        }
      } catch (e) {
        console.warn('Supabase fetch failed, using localStorage:', e);
      }
    }
    
    // Fallback to localStorage
    const photos = getLocalData<any>('bump_photos');
    return photos
      .filter(p => p.user_id === userId)
      .sort((a, b) => a.week - b.week);
  },

  async updateAnalysis(photoId: string, analysis: string) {
    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bump_photos')
          .update({ ai_analysis: analysis })
          .eq('id', photoId);
        
        if (!error) return;
      } catch (e) {
        console.warn('Supabase update failed, using localStorage:', e);
      }
    }
    
    // Fallback to localStorage
    const photos = getLocalData<any>('bump_photos');
    const index = photos.findIndex(p => p.id === photoId);
    if (index >= 0) {
      photos[index].ai_analysis = analysis;
      setLocalData('bump_photos', photos);
    }
  },

  async delete(photoId: string, storagePath: string) {
    // Try Supabase first
    if (isSupabaseConfigured() && !storagePath.startsWith('local_')) {
      try {
        await supabase.storage
          .from('bump-photos')
          .remove([storagePath]);
        
        const { error } = await supabase
          .from('bump_photos')
          .delete()
          .eq('id', photoId);
        
        if (!error) return;
      } catch (e) {
        console.warn('Supabase delete failed, using localStorage:', e);
      }
    }
    
    // Fallback to localStorage
    let photos = getLocalData<any>('bump_photos');
    photos = photos.filter(p => p.id !== photoId);
    setLocalData('bump_photos', photos);
  }
};

// =====================================================
// APPOINTMENT SERVICE (localStorage)
// =====================================================
export const AppointmentService = {
  async add(appointment: any) {
    const userId = getUserId();
    const appointments = getLocalData<any>('appointments');
    
    const newAppointment = {
      id: generateId(),
      user_id: userId,
      ...appointment,
      reminder_sent: false,
      created_at: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    setLocalData('appointments', appointments);
    return newAppointment;
  },

  async getAll() {
    const userId = getUserId();
    const appointments = getLocalData<any>('appointments');
    
    return appointments
      .filter(a => a.user_id === userId)
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
  },

  async update(id: string, updates: any) {
    const appointments = getLocalData<any>('appointments');
    const index = appointments.findIndex(a => a.id === id);
    
    if (index >= 0) {
      appointments[index] = { ...appointments[index], ...updates };
      setLocalData('appointments', appointments);
    }
  },

  async delete(id: string) {
    let appointments = getLocalData<any>('appointments');
    appointments = appointments.filter(a => a.id !== id);
    setLocalData('appointments', appointments);
  }
};

// =====================================================
// NUTRITION SERVICE (localStorage)
// =====================================================
export const NutritionService = {
  async logMeal(mealType: string, foods: any[], calories?: number, week?: number) {
    const userId = getUserId();
    const logs = getLocalData<any>('nutrition_logs');
    
    const newLog = {
      id: generateId(),
      user_id: userId,
      meal_type: mealType,
      foods: foods,
      calories: calories || null,
      ai_suggestions: null,
      week: week || null,
      created_at: new Date().toISOString()
    };
    
    logs.push(newLog);
    setLocalData('nutrition_logs', logs);
    return newLog;
  },

  async getTodayMeals() {
    const userId = getUserId();
    const logs = getLocalData<any>('nutrition_logs');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs
      .filter(log => 
        log.user_id === userId && 
        new Date(log.created_at) >= today
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async updateAiSuggestions(id: string, suggestions: string) {
    const logs = getLocalData<any>('nutrition_logs');
    const index = logs.findIndex(l => l.id === id);
    
    if (index >= 0) {
      logs[index].ai_suggestions = suggestions;
      setLocalData('nutrition_logs', logs);
    }
  },

  async delete(id: string) {
    let logs = getLocalData<any>('nutrition_logs');
    logs = logs.filter(l => l.id !== id);
    setLocalData('nutrition_logs', logs);
  }
};

// =====================================================
// HEALTH TRACKING SERVICE (localStorage)
// =====================================================
export const HealthService = {
  async log(data: any) {
    const userId = getUserId();
    const logs = getLocalData<any>('health_tracking');
    
    const newLog = {
      id: generateId(),
      user_id: userId,
      ...data,
      created_at: new Date().toISOString()
    };
    
    logs.push(newLog);
    setLocalData('health_tracking', logs);
    return newLog;
  },

  async getHistory(limit: number = 30) {
    const userId = getUserId();
    const logs = getLocalData<any>('health_tracking');
    
    return logs
      .filter(l => l.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
};
