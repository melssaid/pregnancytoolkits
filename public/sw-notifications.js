/**
 * Service Worker for Push Notifications
 * Handles showing notifications even when the app is in background/closed
 */

const SW_VERSION = '2.0.1';

let scheduledTimers = [];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

function clearAllTimers() {
  scheduledTimers.forEach(id => clearTimeout(id));
  scheduledTimers = [];
}

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
  }, delayMs);
  scheduledTimers.push(timerId);
}

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
    clearAllTimers();
    const { reminders } = payload;
    if (!reminders || !Array.isArray(reminders)) return;
    const now = Date.now();
    reminders.forEach((reminder) => {
      const delayMs = reminder.fireAt - now;
      if (delayMs > 0) scheduleNotification(reminder, delayMs);
    });
  }

  if (type === 'CLEAR_SCHEDULES') {
    clearAllTimers();
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (url !== '/') client.navigate(url);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('notificationclose', () => {});
