/**
 * Core Web Vitals measurement & storage
 * Tracks LCP, CLS, FID, INP — the metrics Google uses for ranking
 */

const VITALS_KEY = 'pt_web_vitals';

interface VitalsEntry {
  lcp?: number;
  cls?: number;
  fid?: number;
  inp?: number;
  ttfb?: number;
  ts: string;
  url: string;
}

function storeMetric(name: string, value: number) {
  try {
    const raw = localStorage.getItem(VITALS_KEY);
    const entries: VitalsEntry[] = raw ? JSON.parse(raw) : [];
    
    // Update the latest entry for the current page or create new
    const url = window.location.pathname;
    let entry = entries.find(e => e.url === url && Date.now() - new Date(e.ts).getTime() < 60000);
    
    if (!entry) {
      entry = { ts: new Date().toISOString(), url };
      entries.push(entry);
    }
    
    (entry as any)[name.toLowerCase()] = Math.round(value * 100) / 100;
    
    // Keep last 50 entries
    if (entries.length > 50) entries.splice(0, entries.length - 50);
    localStorage.setItem(VITALS_KEY, JSON.stringify(entries));
  } catch { }
}

export function initWebVitals() {
  // Use dynamic import to keep bundle small — web-vitals is tree-shakeable
  import('web-vitals').then(({ onLCP, onCLS, onFID, onINP, onTTFB }) => {
    onLCP(({ value }) => storeMetric('lcp', value));
    onCLS(({ value }) => storeMetric('cls', value));
    onFID(({ value }) => storeMetric('fid', value));
    onINP(({ value }) => storeMetric('inp', value));
    onTTFB(({ value }) => storeMetric('ttfb', value));
  }).catch(() => {
    // Silent fail — vitals are non-critical
  });
}

/** Get stored vitals for debug/settings panel */
export function getStoredVitals(): VitalsEntry[] {
  try {
    const raw = localStorage.getItem(VITALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
