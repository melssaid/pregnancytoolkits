import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const VISITOR_ID_KEY = 'pt_visitor_id';
const LAST_SESSION_KEY = 'pt_last_session';
const SESSION_GAP_MS = 30 * 60 * 1000; // 30 min gap = new session

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function isTWA(): boolean {
  return (
    document.referrer.includes('android-app://') ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

function getPlatform(): string {
  if (isTWA()) return 'twa';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'pwa';
  return 'web';
}

export function useVisitorTracking() {
  useEffect(() => {
    const track = async () => {
      try {
        const now = Date.now();
        const last = parseInt(localStorage.getItem(LAST_SESSION_KEY) || '0', 10);
        
        // Skip if within same session gap
        if (now - last < SESSION_GAP_MS) return;
        
        localStorage.setItem(LAST_SESSION_KEY, String(now));

        const visitorId = getOrCreateVisitorId();
        const lang = document.documentElement.lang || navigator.language?.split('-')[0] || 'en';

        await (supabase as any).from('visitor_sessions').insert({
          visitor_id: visitorId,
          language: lang,
          platform: getPlatform(),
          referrer: document.referrer || null,
          screen_width: window.innerWidth,
          is_twa: isTWA(),
        });
      } catch {
        // Silent fail — tracking should never break the app
      }
    };

    track();
  }, []);
}
