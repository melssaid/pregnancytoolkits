import { supabase } from '@/integrations/supabase/client';

// ==================== USER ID HELPER ====================
const getUserId = (): string => {
  let userId = localStorage.getItem('pregnancy_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pregnancy_user_id', userId);
  }
  return userId;
};

// ==================== USER PROFILE ====================
export const UserProfileService = {
  async get() {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsert(profile: any) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ ...profile, user_id: userId, updated_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWeek(week: number) {
    const userId = getUserId();
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, pregnancy_week: week, updated_at: new Date().toISOString() });
    
    if (error) throw error;
  }
};

// ==================== HEALTH TRACKING ====================
export const HealthService = {
  async add(entry: any) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('health_tracking')
      .insert({ ...entry, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getHistory(limit = 30) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('health_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getLatest() {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('health_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getWeeklyAverage() {
    const userId = getUserId();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('health_tracking')
      .select('weight, heart_rate, blood_pressure_systolic, blood_pressure_diastolic')
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString());
    
    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const weights = data.filter(d => d.weight).map(d => d.weight);
    const heartRates = data.filter(d => d.heart_rate).map(d => d.heart_rate);
    
    return {
      avgWeight: weights.length ? avg(weights).toFixed(1) : null,
      avgHeartRate: heartRates.length ? Math.round(avg(heartRates)) : null,
      recordCount: data.length
    };
  }
};

// ==================== BUMP PHOTOS ====================
export const BumpPhotoService = {
  async upload(file: File, week: number, caption?: string) {
    const userId = getUserId();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${week}_${Date.now()}.${fileExt}`;
    
    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('bump-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('bump-photos')
      .getPublicUrl(fileName);
    
    // Save to Database
    const { data, error } = await supabase
      .from('bump_photos')
      .insert({
        user_id: userId,
        week,
        public_url: publicUrl,
        storage_path: fileName,
        caption
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('bump_photos')
      .select('*')
      .eq('user_id', userId)
      .order('week', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByWeek(week: number) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('bump_photos')
      .select('*')
      .eq('user_id', userId)
      .eq('week', week)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async delete(id: string, storagePath: string) {
    // Delete from Storage
    await supabase.storage.from('bump-photos').remove([storagePath]);
    
    // Delete from Database
    const { error } = await supabase
      .from('bump_photos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateAnalysis(id: string, aiAnalysis: string) {
    const { error } = await supabase
      .from('bump_photos')
      .update({ ai_analysis: aiAnalysis, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateCaption(id: string, caption: string) {
    const { error } = await supabase
      .from('bump_photos')
      .update({ caption, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ==================== VITAMIN TRACKER ====================
export const VitaminService = {
  async log(vitaminName: string, dosage?: string, week?: number) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('vitamin_logs')
      .insert({ user_id: userId, vitamin_name: vitaminName, dosage, week })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTodayLogs() {
    const userId = getUserId();
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('vitamin_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('taken_at', `${today}T00:00:00`)
      .lte('taken_at', `${today}T23:59:59`);
    
    if (error) throw error;
    return data || [];
  },

  async getHistory(days = 7) {
    const userId = getUserId();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('vitamin_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('taken_at', startDate.toISOString())
      .order('taken_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async deleteLog(id: string) {
    const { error } = await supabase
      .from('vitamin_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ==================== APPOINTMENTS ====================
export const AppointmentService = {
  async add(appointment: any) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('appointments')
      .insert({ ...appointment, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getUpcoming() {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: any) {
    const { error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async markReminderSent(id: string) {
    const { error } = await supabase
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ==================== KICK COUNTER ====================
export const KickService = {
  async startSession(week: number) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('kick_sessions')
      .insert({ user_id: userId, week, kicks: [], total_kicks: 0 })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addKick(sessionId: string, currentKicks: any[], timestamp: string) {
    const newKicks = [...currentKicks, { time: timestamp }];
    const { error } = await supabase
      .from('kick_sessions')
      .update({ kicks: newKicks, total_kicks: newKicks.length })
      .eq('id', sessionId);
    
    if (error) throw error;
    return newKicks;
  },

  async endSession(sessionId: string, durationMinutes: number, notes?: string) {
    const { error } = await supabase
      .from('kick_sessions')
      .update({ 
        ended_at: new Date().toISOString(), 
        duration_minutes: durationMinutes, 
        notes 
      })
      .eq('id', sessionId);
    
    if (error) throw error;
  },

  async getActiveSession() {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('kick_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getHistory(limit = 10) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('kick_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getTodaySessions() {
    const userId = getUserId();
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('kick_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', `${today}T00:00:00`)
      .not('ended_at', 'is', null);
    
    if (error) throw error;
    return data || [];
  }
};

// ==================== NUTRITION ====================
export const NutritionService = {
  async logMeal(mealType: string, foods: any[], calories?: number, week?: number) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({ user_id: userId, meal_type: mealType, foods, calories, week })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTodayMeals() {
    const userId = getUserId();
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getHistory(days = 7) {
    const userId = getUserId();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateAiSuggestions(id: string, suggestions: string) {
    const { error } = await supabase
      .from('nutrition_logs')
      .update({ ai_suggestions: suggestions })
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ==================== WORKOUT PROGRESS ====================
export const WorkoutService = {
  async log(workoutType: string, exercises: any[], durationMinutes?: number, caloriesBurned?: number, week?: number) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('workout_progress')
      .insert({ 
        user_id: userId, 
        workout_type: workoutType, 
        exercises, 
        duration_minutes: durationMinutes, 
        calories_burned: caloriesBurned, 
        week 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getHistory(limit = 20) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('workout_progress')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getWeeklyStats() {
    const userId = getUserId();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('workout_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', weekAgo.toISOString());
    
    if (error) throw error;
    
    const totalMinutes = data?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
    const totalCalories = data?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0;
    
    return {
      workoutCount: data?.length || 0,
      totalMinutes,
      totalCalories
    };
  }
};

// ==================== FAVORITE VIDEOS ====================
export const VideoService = {
  async addFavorite(videoId: string, videoUrl: string, title?: string, category?: string) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('favorite_videos')
      .upsert({ user_id: userId, video_id: videoId, video_url: videoUrl, title, category })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeFavorite(videoId: string) {
    const userId = getUserId();
    const { error } = await supabase
      .from('favorite_videos')
      .delete()
      .eq('user_id', userId)
      .eq('video_id', videoId);
    
    if (error) throw error;
  },

  async getFavorites() {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('favorite_videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async isFavorite(videoId: string) {
    const userId = getUserId();
    const { data } = await supabase
      .from('favorite_videos')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single();
    
    return !!data;
  }
};

// ==================== AI CONVERSATIONS ====================
export const ConversationService = {
  async save(toolName: string, messages: any[]) {
    const userId = getUserId();
    
    const { data: existing } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_name', toolName)
      .single();
    
    if (existing) {
      await supabase
        .from('ai_conversations')
        .update({ messages, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('ai_conversations')
        .insert({ user_id: userId, tool_name: toolName, messages });
    }
  },

  async get(toolName: string) {
    const userId = getUserId();
    
    const { data } = await supabase
      .from('ai_conversations')
      .select('messages')
      .eq('user_id', userId)
      .eq('tool_name', toolName)
      .single();
    
    return data?.messages || [];
  },

  async clear(toolName: string) {
    const userId = getUserId();
    
    await supabase
      .from('ai_conversations')
      .delete()
      .eq('user_id', userId)
      .eq('tool_name', toolName);
  }
};

export { getUserId };
