const CACHE_NAME = 'groomora-v6';

// Instalar — sin precachear nada agresivamente
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activar — limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Network first SIEMPRE para HTML y JS
// Solo cachea imágenes y fuentes estáticas
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // HTML — siempre de red, nunca cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // JS/CSS — network first, fallback cache
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Imágenes y fuentes — cache first
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Todo lo demás — network first
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
