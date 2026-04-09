import { useEffect } from 'react';

const ATTRIBUTION_KEY = 'pt_attribution';

interface Attribution {
  source: string;
  medium: string;
  campaign: string;
  timestamp: number;
  landingPage: string;
}

export function captureAttribution() {
  try {
    // Only capture on first visit
    if (localStorage.getItem(ATTRIBUTION_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer;

    let source = params.get('utm_source') || '';
    let medium = params.get('utm_medium') || '';
    const campaign = params.get('utm_campaign') || '';

    // Auto-detect source from referrer
    if (!source && referrer) {
      try {
        const refHost = new URL(referrer).hostname;
        if (refHost.includes('google')) { source = 'google'; medium = 'organic'; }
        else if (refHost.includes('facebook') || refHost.includes('fb.')) { source = 'facebook'; medium = 'social'; }
        else if (refHost.includes('instagram')) { source = 'instagram'; medium = 'social'; }
        else if (refHost.includes('twitter') || refHost.includes('x.com')) { source = 'twitter'; medium = 'social'; }
        else if (refHost.includes('whatsapp')) { source = 'whatsapp'; medium = 'social'; }
        else { source = refHost; medium = 'referral'; }
      } catch { /* ignore */ }
    }

    if (!source) {
      source = 'direct';
      medium = 'none';
    }

    const attribution: Attribution = {
      source,
      medium,
      campaign,
      timestamp: Date.now(),
      landingPage: window.location.pathname,
    };

    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch { /* ignore */ }
}

export function getAttribution(): Attribution | null {
  try {
    const data = localStorage.getItem(ATTRIBUTION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function useAttribution() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return getAttribution();
}
