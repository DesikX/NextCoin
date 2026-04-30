//
const CACHE_NAME = 'nextcoin-v4'; // <--- ВСЕГДА меняй версию (v3, v4...), если обновил код!
const ASSETS = [
  './',
  'index.html',
  'app.css',
  'app.js',
  'manifest.json', // Рекомендую добавить и его
  'img/home.png',
  'img/wallet.png',
  'img/user.png'
];

// 1. Установка: кешируем ресурсы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Кеширование ресурсов');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Заставляет новый SW активироваться сразу
});

// 2. Активация: чистим все старые кеши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Сразу берем управление над всеми вкладками
});

// 3. Запросы: стратегия "Network First" для JS и CSS (чтобы обновления долетали быстрее)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});