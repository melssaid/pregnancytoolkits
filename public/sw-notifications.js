/**
 * Service Worker for Push Notifications
 * Handles showing notifications even when the app is in background/closed
 * Supports scheduled reminders that fire at the right time independently
 */

const SW_VERSION = '2.0.0';

// Scheduled reminders storage
let scheduledTimers = [];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed v' + SW_VERSION);
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated v' + SW_VERSION);
  event.waitUntil(self.clients.claim());
});

/**
 * Clear all scheduled timers
 */
function clearAllTimers() {
  scheduledTimers.forEach(id => clearTimeout(id));
  scheduledTimers = [];
}

/**
 * Schedule a notification to fire at a specific delay (ms)
 */
function scheduleNotification(reminder, delayMs) {
  if (delayMs < 0) return;

  const timerId = setTimeout(() => {
    self.registration.showNotification(reminder.title, {
      body: reminder.body,
      icon: reminder.icon || '/favicon.png',
      badge: '/favicon.png',
      tag: reminder.tag || 'pregnancy-reminder-' + Date.now(),
      data: { url: reminder.url || '/' },
      vibrate: [100, 50, 100],
      requireInteraction: false,
      silent: false,
    });
    console.log('[SW] Scheduled notification fired:', reminder.title);
  }, delayMs);

  scheduledTimers.push(timerId);
  console.log('[SW] Notification scheduled in', Math.round(delayMs / 60000), 'minutes:', reminder.title);
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag, url, badge } = payload;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: icon || '/favicon.png',
        badge: badge || '/favicon.png',
        tag: tag || 'pregnancy-tools',
        data: { url: url || '/' },
        vibrate: [100, 50, 100],
        requireInteraction: false,
        silent: false,
      })
    );
  }

  if (type === 'SCHEDULE_REMINDERS') {
    // Clear previous schedules and set new ones
    clearAllTimers();
    const { reminders } = payload;
    if (!reminders || !Array.isArray(reminders)) return;

    const now = Date.now();
    reminders.forEach((reminder) => {
      const fireAt = reminder.fireAt; // timestamp in ms
      const delayMs = fireAt - now;
      if (delayMs > 0) {
        scheduleNotification(reminder, delayMs);
      }
    });
    console.log('[SW] Scheduled', reminders.filter(r => r.fireAt > now).length, 'reminders');
  }

  if (type === 'CLEAR_SCHEDULES') {
    clearAllTimers();
    console.log('[SW] All scheduled reminders cleared');
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (url !== '/') {
            client.navigate(url);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed');
});
