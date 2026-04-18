/**
 * UpdateAvailableBanner
 * Detects when a new Service Worker has been installed and is waiting to activate.
 * Shows a polished refresh button that clears all caches and reloads the app.
 */

import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { playNotificationSound } from '@/lib/notificationSound';
import { haptics } from '@/lib/haptics';

const DISMISS_KEY = 'pt_update_dismissed_at';
const DISMISS_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const UpdateAvailableBanner = () => {
  const { t } = useTranslation();
  const [updateReady, setUpdateReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Respect recent dismissal
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return;

    let cancelled = false;

    const checkForUpdate = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg || cancelled) return;

        // Already a waiting SW → update is ready right now
        if (reg.waiting) {
          setUpdateReady(true);
          return;
        }

        // Listen for new SW installation
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });

        // Force a check
        reg.update().catch(() => {});
      } catch {
        /* ignore */
      }
    };

    checkForUpdate();

    // Re-check when tab regains focus
    const onFocus = () => checkForUpdate();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear all caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // Activate the waiting SW
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    } catch {
      /* ignore */
    } finally {
      // Hard reload to fetch fresh assets
      setTimeout(() => window.location.reload(), 300);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setUpdateReady(false);
  };

  if (!updateReady) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl bg-gradient-to-r from-primary/95 to-primary/85 backdrop-blur-md shadow-2xl border border-primary-foreground/20 p-3 flex items-center gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-primary-foreground leading-tight">
            {t('update.available', 'تحديث جديد متوفر')}
          </p>
          <p className="text-[11px] text-primary-foreground/80 leading-tight mt-0.5">
            {t('update.description', 'اضغط للتحديث وحذف الكاش القديم')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="shrink-0 px-3 h-9 rounded-full bg-primary-foreground text-primary text-[12px] font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {t('update.refresh', 'تحديث')}
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-primary-foreground/60 text-lg leading-none px-1"
          aria-label="dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};
