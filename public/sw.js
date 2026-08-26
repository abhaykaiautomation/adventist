// Deliberately minimal: this exists mainly to satisfy PWA installability
// checks, not to provide real offline support for an app with signed-in,
// per-parent data. It only ever caches the small set of static brand assets
// below — pages, API routes, auth, and payments always go straight to the
// network so nothing sensitive or dynamic is ever served stale from cache.
const CACHE_NAME = "taa-shell-v1";
const PRECACHE_URLS = ["/icons/icon-192.png", "/icons/icon-512.png", "/TAA-Logo-header.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || !PRECACHE_URLS.includes(url.pathname)) {
    return; // let the browser handle everything else normally
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
