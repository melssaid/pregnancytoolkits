import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getPermissionStatus,
  requestPermission,
  initPushNotifications,
  showPushNotification,
} from '@/lib/pushNotifications';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';

/** Register periodic background sync for daily notifications */
async function registerPeriodicSync() {
  try {
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) {
      await (reg as any).periodicSync.register('daily-notifications', {
        minInterval: 12 * 60 * 60 * 1000, // 12 hours
      });
    }
  } catch {
    // Periodic sync not supported or permission denied — silent fallback
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

  // Initialize on mount
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

  // Request permission and enable push notifications
  const enablePush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) return false;

    const currentPermission = getPermissionStatus();

    if (currentPermission === 'denied') {
      // Cannot request again - browser blocks it
      setState((prev) => ({ ...prev, permission: 'denied' }));
      return false;
    }

    if (currentPermission === 'granted') {
      setState((prev) => ({ ...prev, permission: 'granted', enabled: true }));
      safeSaveToLocalStorage(PUSH_ENABLED_KEY, true);
      registerPeriodicSync();
      return true;
    }

    // Request permission
    const result = await requestPermission();
    const enabled = result === 'granted';

    setState((prev) => ({ ...prev, permission: result, enabled }));
    safeSaveToLocalStorage(PUSH_ENABLED_KEY, enabled);

    if (enabled) registerPeriodicSync();

    return enabled;
  }, []);

  // Disable push notifications
  const disablePush = useCallback(() => {
    setState((prev) => ({ ...prev, enabled: false }));
    safeSaveToLocalStorage(PUSH_ENABLED_KEY, false);
  }, []);

  // Send a push notification (only if enabled)
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
