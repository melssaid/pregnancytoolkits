/**
 * Authentication utilities for the pregnancy app
 * Uses localStorage-based user identification for seamless experience
 */

const USER_ID_KEY = 'pregnancy_user_id';

/**
 * Get or create a local user identifier.
 * No external auth calls - fully offline-capable.
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
 * No-op for backward compatibility.
 */
export async function ensureAuthenticated() {
  return { id: getLocalUserId() };
}
