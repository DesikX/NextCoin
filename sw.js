//
const CACHE_NAME = 'nextcoin-v7'; // Каждое изменение стилей = новая версия (v3, v4...)
const ASSETS = [
    './',
    'index.html',
    'app.css',
    'app.js',
    'manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting(); // Принудительно активируем новый SW сразу[cite: 3]
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // Заставляем SW сразу управлять всеми вкладками[cite: 3]
});

// Стратегия Network First: сначала идем в сеть, если нет — в кэш[cite: 3]
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});