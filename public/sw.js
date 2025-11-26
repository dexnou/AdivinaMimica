const CACHE_NAME = 'mimica-master-v3';

// Archivos que SI O SI deben estar cacheados desde el principio
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza al SW a activarse inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Solo interceptamos peticiones GET (no POST, etc)
  if (event.request.method !== 'GET') return;

  // Estrategia: Cache First, falling back to Network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 1. Si está en cache, lo devolvemos
        if (response) {
          return response;
        }

        // 2. Si no, clonamos la petición y la hacemos a internet
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Chequeamos si la respuesta es válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 3. Si internet responde bien, guardamos esa respuesta en cache para el futuro
            // Esto es CRUCIAL para Vite, porque los nombres de los archivos JS cambian en cada build
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Limpiar caches viejas cuando subes una nueva versión
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});