import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getPermissionStatus,
  requestPermission,
  initPushNotifications,
  showPushNotification,
} from '@/lib/pushNotifications';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { supabase } from '@/integrations/supabase/client';
import i18n from '@/i18n';

const VAPID_PUBLIC_KEY = 'BCQ2QGl7rRwrzUwCTpP84RLAKdsoI-u61PUe1J83ZAqowJELVxxuFoZVZb-vKM-GP2StukfgTbHHMCKobOb3TVc';

/** Convert base64url VAPID key to Uint8Array for PushManager */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/** Register periodic background sync for daily notifications */
async function registerPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) {
      await (reg as any).periodicSync.register('daily-notifications', {
        minInterval: 12 * 60 * 60 * 1000,
      });
    }
  } catch {
    // silent
  }
}

/** Subscribe to Web Push and save subscription to database */
async function subscribeToPush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    let subscription = await reg.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subJson.endpoint || '';
    const p256dh = subJson.keys?.p256dh || '';
    const auth = subJson.keys?.auth || '';

    if (!endpoint || !p256dh || !auth) return false;

    // Get user's pregnancy week from profile
    let pregnancyWeek = 0;
    try {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        const profile = JSON.parse(stored);
        if (profile.pregnancyWeek) pregnancyWeek = profile.pregnancyWeek;
      }
    } catch {}

    // Upsert subscription to database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_language: i18n.language || 'en',
          pregnancy_week: pregnancyWeek,
        },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.error('[Push] Failed to save subscription:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Push] Subscribe failed:', err);
    return false;
  }
}

interface PushState {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  enabled: boolean;
}

const PUSH_ENABLED_KEY = 'pushNotificationsEnabled';

export function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: 'unsupported',
    enabled: false,
  });

  useEffect(() => {
    const init = async () => {
      const { supported, permission } = await initPushNotifications();
      const savedEnabled = safeParseLocalStorage<boolean>(
        PUSH_ENABLED_KEY,
        false,
        (v): v is boolean => typeof v === 'boolean'
      );

      setState({
        supported,
        permission,
        enabled: savedEnabled && permission === 'granted',
      });
    };

    init();
  }, []);

  const enablePush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) return false;

    const currentPermission = getPermissionStatus();

    if (currentPermission === 'denied') {
      setState((prev) => ({ ...prev, permission: 'denied' }));
      return false;
    }

    let granted = currentPermission === 'granted';

    if (!granted) {
      const result = await requestPermission();
      granted = result === 'granted';
      setState((prev) => ({ ...prev, permission: result }));
    }

    if (granted) {
      // Subscribe to Web Push and save to database
      const subscribed = await subscribeToPush();
      setState((prev) => ({ ...prev, permission: 'granted', enabled: true }));
      safeSaveToLocalStorage(PUSH_ENABLED_KEY, true);
      registerPeriodicSync();
      
      if (!subscribed) {
        console.warn('[Push] Enabled locally but failed to register with server');
      }
      return true;
    }

    setState((prev) => ({ ...prev, enabled: false }));
    safeSaveToLocalStorage(PUSH_ENABLED_KEY, false);
    return false;
  }, []);

  const disablePush = useCallback(() => {
    setState((prev) => ({ ...prev, enabled: false }));
    safeSaveToLocalStorage(PUSH_ENABLED_KEY, false);
  }, []);

  const sendPush = useCallback(
    async (options: {
      title: string;
      body: string;
      tag?: string;
      url?: string;
    }): Promise<boolean> => {
      if (!state.enabled || state.permission !== 'granted') return false;
      return showPushNotification(options);
    },
    [state.enabled, state.permission]
  );

  return {
    supported: state.supported,
    permission: state.permission,
    enabled: state.enabled,
    enablePush,
    disablePush,
    sendPush,
  };
}
