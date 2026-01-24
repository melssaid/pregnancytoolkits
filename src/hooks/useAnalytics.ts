import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

const SESSION_KEY = 'wellmama_session_id';
const SESSION_EXPIRY_KEY = 'wellmama_session_expiry';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate or retrieve anonymous session ID with automatic rotation
 * Sessions expire after 7 days for privacy
 */
const getSessionId = (): string => {
  try {
    const now = Date.now();
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    const existingSession = localStorage.getItem(SESSION_KEY);

    // Return existing session if still valid
    if (expiry && existingSession && now < parseInt(expiry, 10)) {
      return existingSession;
    }

    // Generate new session with expiry
    const newSession = `${now}-${Math.random().toString(36).substring(2, 11)}`;
    const newExpiry = (now + SESSION_DURATION_MS).toString();

    localStorage.setItem(SESSION_KEY, newSession);
    localStorage.setItem(SESSION_EXPIRY_KEY, newExpiry);

    return newSession;
  } catch {
    // Fallback for when localStorage is unavailable
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
};

/**
 * Sanitize referrer URL to only include origin (no paths or query params)
 * This prevents collecting potentially sensitive URL information
 */
const getSanitizedReferrer = (): string | null => {
  try {
    if (!document.referrer) return null;
    const url = new URL(document.referrer);
    return url.origin;
  } catch {
    return null;
  }
};

/**
 * Validate tool ID format to match database constraints
 * Must be 2-50 chars, lowercase alphanumeric with hyphens/underscores
 */
const isValidToolId = (toolId: string): boolean => {
  return /^[a-z0-9_-]{2,50}$/.test(toolId);
};

/**
 * Validate action type format to match database constraints
 * Must be 2-50 chars, lowercase with underscores
 */
const isValidActionType = (actionType: string): boolean => {
  return /^[a-z_]{2,50}$/.test(actionType);
};

/**
 * Analytics hook for anonymous tool usage tracking
 * 
 * Privacy features:
 * - No PII collection
 * - Session IDs rotate every 7 days
 * - Referrer URLs are sanitized to origin only
 * - Timestamps use database created_at, not client time
 */
export function useAnalytics(toolId: string) {
  const sessionId = getSessionId();

  // Track page view on mount
  useEffect(() => {
    // Validate tool ID before tracking
    if (!isValidToolId(toolId)) {
      console.warn('Invalid tool ID format, skipping analytics');
      return;
    }

    const trackView = async () => {
      try {
        const metadata: Json = {
          referrer_origin: getSanitizedReferrer(),
        };
        
        await supabase.from('tool_analytics').insert({
          tool_id: toolId,
          session_id: sessionId.substring(0, 100),
          action_type: 'view',
          metadata,
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackView();
  }, [toolId, sessionId]);

  // Track custom actions
  const trackAction = useCallback(
    async (actionType: string, metadata: Record<string, unknown> = {}) => {
      // Validate inputs
      if (!isValidToolId(toolId) || !isValidActionType(actionType)) {
        console.warn('Invalid tool ID or action type, skipping analytics');
        return;
      }

      // Sanitize metadata - only allow primitive values, limit size
      const sanitizedMetadata: Record<string, Json> = {};
      let metadataSize = 0;
      const MAX_METADATA_SIZE = 5000; // 5KB limit (half of DB constraint for safety)

      for (const [key, value] of Object.entries(metadata)) {
        // Only include primitive values (no objects, arrays, or functions)
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          const entrySize = key.length + String(value).length;
          if (metadataSize + entrySize < MAX_METADATA_SIZE) {
            sanitizedMetadata[key] = value;
            metadataSize += entrySize;
          }
        }
      }

      try {
        await supabase.from('tool_analytics').insert({
          tool_id: toolId,
          session_id: sessionId.substring(0, 100),
          action_type: actionType,
          metadata: sanitizedMetadata as Json,
        });
      } catch (error) {
        console.debug('Analytics tracking failed:', error);
      }
    },
    [toolId, sessionId]
  );

  return { trackAction };
}

export default useAnalytics;
