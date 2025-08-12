self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("ow-cache-v1").then((cache) => cache.addAll(["/", "/index.html"])));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (res) =>
        res ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open("ow-cache-v1").then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => res),
    ),
  );
});
