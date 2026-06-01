// Raykota SW v1 - Minimal, no caching
const CACHE_NAME = 'raykota-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});
// NO caching — always network
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
