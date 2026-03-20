/**
 * Service Worker for Push Notifications + Asset Caching
 * Handles notifications in background + caches static assets for performance
 */

const SW_VERSION = '3.0.0';
const CACHE_NAME = `pt-cache-v${SW_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/favicon.png',
  '/logo.webp',
];

// Cache-first patterns (static assets)
const CACHE_FIRST_PATTERNS = [
  /\/assets\//,
  /\/fonts\//,
  /\/icons\//,
  /\.woff2?$/,
  /\.ttf$/,
  /\.webp$/,
  /\.png$/,
  /\.jpg$/,
  /\.svg$/,
];

// Network-first patterns (dynamic content)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /supabase/,
  /ai\.gateway/,
];

let scheduledTimers = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip network-first patterns (API calls)
  if (NETWORK_FIRST_PATTERNS.some(p => p.test(url.href))) return;

  // Never intercept Vite dev module/HMR requests
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.searchParams.has('t')
  ) {
    return;
  }

  // Cache-first for static assets
  if (CACHE_FIRST_PATTERNS.some(p => p.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for HTML/JS/CSS
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
  }
});

// ── Notification handlers ──

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
