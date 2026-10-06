/**
 * Service Worker Sederhana - Survei Kepuasan Masyarakat (MPP Gampil)
 * Mendukung caching shell dan sinkronisasi data offline dari IndexedDB ke Firestore
 */

const CACHE_NAME = 'mpp-gampil-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/gampil-logo.svg',
  '/gampil-emblem.svg',
  '/mpp-building-icon.svg',
  '/menu-beranda-logo.svg',
  '/menu-dashboard-logo.svg',
  '/logo-mpp-baru-3d.svg',
  '/logo-mpp-admin-3d.svg',
  '/logo-mpp-beranda-3d.svg'
];

// Install Event: Cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('SW Pre-cache non-fatal error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-first with cache fallback for HTML/assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip Firestore API and Google API requests from caching
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('identitytoolkit')
  ) {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Optionally cache successful responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Background Sync Event: Kirim sinyal sinkronisasi ke semua client yang aktif
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-surveys' || event.tag === 'gampil-sync') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});

// Message listener from active window clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
