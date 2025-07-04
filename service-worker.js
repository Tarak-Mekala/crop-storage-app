const CACHE_NAME = "crop-storage-cache-v1";
const FILES = ["index.html","style.css","script.js","manifest.json","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES))).then(() => self.skipWaiting()));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
