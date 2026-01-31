import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Get or create user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem('pregnancy_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pregnancy_user_id', userId);
  }
  return userId;
};

// Hook for user profile
export const useUserProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProfile = useCallback(async () => {
    try {
      const userId = getUserId();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: any) => {
    try {
      const userId = getUserId();
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ ...updates, user_id: userId, updated_at: new Date().toISOString() })
        .select()
        .single();
      
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error: any) {
      toast({
        title: 'خطأ في الحفظ',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, loading, updateProfile, reload: loadProfile };
};

// Hook for pregnancy week
export const usePregnancyWeek = () => {
  const { profile, updateProfile } = useUserProfile();
  const [week, setWeek] = useState(20);

  useEffect(() => {
    if (profile?.pregnancy_week) {
      setWeek(profile.pregnancy_week);
    }
  }, [profile]);

  const setPregnancyWeek = useCallback(async (newWeek: number) => {
    setWeek(newWeek);
    await updateProfile({ pregnancy_week: newWeek });
  }, [updateProfile]);

  return { week, setWeek: setPregnancyWeek };
};

// Generic data fetching hook
export const useSupabaseQuery = <T>(tableName: string, options?: {
  filter?: { column: string; value: any };
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      
      let query = supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId);
      
      if (options?.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data: result, error: err } = await query;
      
      if (err) throw err;
      setData(result || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error(`Error fetching ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tableName, options?.filter?.column, options?.filter?.value, options?.orderBy?.column, options?.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export { supabase };
