import { supabase } from '@/integrations/supabase/client';

// Helper to get user ID (using localStorage for anonymous users)
const getUserId = (): string => {
  let userId = localStorage.getItem('pregnancy_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('pregnancy_user_id', userId);
  }
  return userId;
};

// =====================================================
// USER PROFILE SERVICE
// =====================================================
export const UserProfileService = {
  async get() {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting profile:', error);
    }
    return data;
  },

  async upsert(profile: any) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// VITAMIN SERVICE
// =====================================================
export const VitaminService = {
  async log(vitaminName: string, dosage: string, week: number) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('vitamin_logs')
      .insert({
        user_id: userId,
        vitamin_name: vitaminName,
        dosage: dosage,
        week: week,
        taken_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTodayLogs() {
    const userId = getUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('vitamin_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('taken_at', today.toISOString())
      .order('taken_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getHistory(days: number = 7) {
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
  }
};

// =====================================================
// KICK COUNTER SERVICE
// =====================================================
export const KickService = {
  async startSession(week: number) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('kick_sessions')
      .insert({
        user_id: userId,
        week: week,
        kicks: [],
        total_kicks: 0,
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting active session:', error);
    }
    return data;
  },

  async addKick(sessionId: string, currentKicks: any[], timestamp: string) {
    const newKicks = [...currentKicks, { time: timestamp }];
    const { error } = await supabase
      .from('kick_sessions')
      .update({
        kicks: newKicks,
        total_kicks: newKicks.length
      })
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
        notes: notes || null
      })
      .eq('id', sessionId);
    
    if (error) throw error;
  },

  async getHistory(limit: number = 10) {
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
  }
};

// =====================================================
// BUMP PHOTO SERVICE
// =====================================================
export const BumpPhotoService = {
  async upload(file: File, week: number, caption?: string) {
    const userId = getUserId();
    const fileName = `${userId}/${week}_${Date.now()}.${file.name.split('.').pop()}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('bump-photos')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('bump-photos')
      .getPublicUrl(fileName);
    
    // Save to database
    const { data, error } = await supabase
      .from('bump_photos')
      .insert({
        user_id: userId,
        week: week,
        storage_path: fileName,
        public_url: urlData.publicUrl,
        caption: caption || null
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

  async updateAnalysis(photoId: string, analysis: string) {
    const { error } = await supabase
      .from('bump_photos')
      .update({ ai_analysis: analysis })
      .eq('id', photoId);
    
    if (error) throw error;
  },

  async delete(photoId: string, storagePath: string) {
    // Delete from storage
    await supabase.storage
      .from('bump-photos')
      .remove([storagePath]);
    
    // Delete from database
    const { error } = await supabase
      .from('bump_photos')
      .delete()
      .eq('id', photoId);
    
    if (error) throw error;
  }
};

// =====================================================
// APPOINTMENT SERVICE
// =====================================================
export const AppointmentService = {
  async add(appointment: any) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: userId,
        ...appointment
      })
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
  }
};

// =====================================================
// NUTRITION SERVICE
// =====================================================
export const NutritionService = {
  async logMeal(mealType: string, foods: any[], calories?: number, week?: number) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({
        user_id: userId,
        meal_type: mealType,
        foods: foods,
        calories: calories || null,
        week: week || null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTodayMeals() {
    const userId = getUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: true });
    
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

// =====================================================
// HEALTH TRACKING SERVICE
// =====================================================
export const HealthService = {
  async log(data: any) {
    const userId = getUserId();
    const { data: result, error } = await supabase
      .from('health_tracking')
      .insert({
        user_id: userId,
        ...data
      })
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async getHistory(limit: number = 30) {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('health_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
};
