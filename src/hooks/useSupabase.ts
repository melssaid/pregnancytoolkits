import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Get or create user ID (stored locally)
export const getUserId = (): string => {
  let userId = localStorage.getItem('pregnancy_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pregnancy_user_id', userId);
  }
  return userId;
};

// Hook for user profile (localStorage-based)
export const useUserProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProfile = useCallback(() => {
    try {
      const userId = getUserId();
      const stored = localStorage.getItem(`profile_${userId}`);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: any) => {
    try {
      const userId = getUserId();
      const newProfile = { ...profile, ...updates, user_id: userId, updated_at: new Date().toISOString() };
      localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
      setProfile(newProfile);
      return newProfile;
    } catch (error: any) {
      toast({
        title: 'خطأ في الحفظ',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast, profile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, loading, updateProfile, reload: loadProfile };
};

// Hook for pregnancy week
export const usePregnancyWeek = () => {
  const { profile, updateProfile } = useUserProfile();
  const [week, setWeek] = useState(0);

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

// Generic localStorage-based data hook
export const useLocalData = <T extends { id: string }>(key: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    try {
      const userId = getUserId();
      const stored = localStorage.getItem(`${key}_${userId}`);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const save = useCallback((items: T[]) => {
    const userId = getUserId();
    localStorage.setItem(`${key}_${userId}`, JSON.stringify(items));
    setData(items);
  }, [key]);

  const add = useCallback((item: Omit<T, 'id'>) => {
    const newItem = { ...item, id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}` } as T;
    const updated = [...data, newItem];
    save(updated);
    return newItem;
  }, [data, save]);

  const remove = useCallback((id: string) => {
    const updated = data.filter(item => item.id !== id);
    save(updated);
  }, [data, save]);

  const update = useCallback((id: string, updates: Partial<T>) => {
    const updated = data.map(item => item.id === id ? { ...item, ...updates } : item);
    save(updated);
  }, [data, save]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, add, remove, update, refetch: load };
};
