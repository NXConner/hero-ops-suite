const CACHE_NAME = "ow-cache-v3";
const ASSET_HOSTS = [self.location.origin];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(["/", "/index.html"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("ow-cache-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

function isAssetRequest(request) {
  try {
    const url = new URL(request.url);
    const isSameHost = ASSET_HOSTS.includes(url.origin);
    const isStatic = /\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf|eot)$/i.test(url.pathname);
    // Only cache GET requests for static assets on same origin
    return request.method === "GET" && isSameHost && isStatic;
  } catch (_e) {
    return false;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isAssetRequest(request)) {
    return; // Let network handle non-asset or cross-origin/api requests
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    }),
  );
});
