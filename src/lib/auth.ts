/**
 * Authentication utilities for the pregnancy app
 * Uses anonymous authentication for seamless user experience
 */
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures the user is authenticated, signing in anonymously if needed.
 * This provides a seamless experience without requiring signup while
 * still enabling proper RLS-based data isolation.
 */
export async function ensureAuthenticated() {
  // Check if already authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return user;
  }
  
  // Sign in anonymously for seamless experience
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    console.error('Anonymous auth failed:', error);
    throw error;
  }
  
  return data.user;
}

/**
 * Hook-compatible auth initialization that can be used in useEffect
 */
export async function initializeAuth(): Promise<void> {
  try {
    await ensureAuthenticated();
  } catch (error) {
    // Log but don't throw - app should still function with localStorage fallback
    console.warn('Auth initialization failed, using local storage fallback:', error);
  }
}
