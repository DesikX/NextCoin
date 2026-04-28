const CACHE_NAME = 'nextcoin-v1';
const ASSETS = [
  'index.html',
  'app.css',
  'app.js',
  'img/home.png',
  'img/wallet.png',
  'img/user.png'
];

// Установка: кешируем ресурсы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Активация: чистим старый кеш
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
});

// Запросы: берем из кеша, если нет сети
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});