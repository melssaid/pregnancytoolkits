/**
 * Service Worker for Push Notifications
 * Handles showing notifications even when the app is in background
 */

const SW_VERSION = '1.0.0';

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

  if (type === 'SCHEDULE_CHECK') {
    // Store scheduled reminders data
    const { reminders } = payload;
    // We'll use the message channel to trigger checks
    console.log('[SW] Received scheduled reminders:', reminders?.length || 0);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (url !== '/') {
            client.navigate(url);
          }
          return;
        }
      }
      // Open a new window if none found
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
