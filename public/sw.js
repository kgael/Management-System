// public/sw.js
const CACHE_NAME = "inventario-clinica-v1.0.0";
const API_CACHE_NAME = "inventario-api-v1.0.0";

// Archivos estáticos para cachear
const STATIC_ASSETS = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/icons/icon-96x96.png",
  "/icons/icon-144x144.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Instalación: cachear recursos esenciales
self.addEventListener("install", (event) => {
  console.log("🟢 Service Worker instalándose...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Cache abierto, agregando recursos estáticos...");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("✅ Todos los recursos cacheados");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Error durante la instalación:", error);
      })
  );
});

// Activación: limpiar caches viejos
self.addEventListener("activate", (event) => {
  console.log("🟢 Service Worker activado");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log("🗑️ Eliminando cache viejo:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ Service Worker listo para controlar clientes");
        return self.clients.claim();
      })
  );
});

// Estrategia de cache: Network First para API, Cache First para estáticos
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Para peticiones de API (backend)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Si la respuesta es exitosa, la guardamos en cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentamos servir desde cache
          return caches.match(request);
        })
    );
    return;
  }

  // Para recursos estáticos (Cache First)
  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        // Si no está en cache, hacemos la petición
        return fetch(request).then((response) => {
          // Verificamos si la respuesta es válida
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clonamos la respuesta para guardarla en cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Fallback para cuando no hay conexión
        if (request.destination === "document") {
          return caches.match("/");
        }
      })
  );
});
