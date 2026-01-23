import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate anonymous session ID (persisted in localStorage)
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('wellmama_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('wellmama_session_id', sessionId);
  }
  return sessionId;
};

export function useAnalytics(toolId: string) {
  const sessionId = getSessionId();

  // Track page view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        await supabase.from('tool_analytics').insert({
          tool_id: toolId,
          session_id: sessionId,
          action_type: 'view',
          metadata: {
            timestamp: new Date().toISOString(),
            referrer: document.referrer || null,
          },
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
      try {
        await supabase.from('tool_analytics').insert({
          tool_id: toolId,
          session_id: sessionId,
          action_type: actionType,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
          },
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
