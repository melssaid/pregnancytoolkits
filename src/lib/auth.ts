/**
 * Authentication utilities for the pregnancy app.
 * Local-only ID for localStorage data (health tracking, vitamins, kicks, etc.)
 * Supabase anonymous auth for cloud-stored data (bump photos).
 */

import { supabase } from '@/integrations/supabase/client';

const USER_ID_KEY = 'pregnancy_user_id';

/**
 * Get or create a local user identifier.
 * Used ONLY for localStorage namespacing — never sent to Supabase.
 */
export function getLocalUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * No-op auth initialization for backward compatibility.
 */
export async function initializeAuth(): Promise<void> {
  getLocalUserId();
}

/**
 * Ensure the user is authenticated with Supabase.
 * Uses anonymous sign-in for seamless experience with proper RLS isolation.
 * Returns the Supabase user object with a cryptographically verified ID.
 */
export async function ensureAuthenticated() {
  // Check for existing session first
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return user;

  // No session — sign in anonymously
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous auth failed:', error.message);
    throw new Error('Authentication failed');
  }
  return data.user;
}
