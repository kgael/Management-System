// public/sw.js - VERSIÓN CORREGIDA Y COMPLETA
const CACHE_NAME = "inventario-clinica-v1.1.0";
const API_CACHE_NAME = "inventario-api-v1.1.0";

// Archivos estáticos para cachear - RUTAS CORREGIDAS
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png", 
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/LogotipoSanta.png",
  "/logotipo.jpg",
];

// Instalación: cachear recursos esenciales
self.addEventListener("install", (event) => {
  console.log("🟢 Service Worker instalándose...");
  
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Cache abierto, agregando recursos estáticos...");
        // Usar cache.addAll con manejo de errores individual
        return Promise.all(
          STATIC_ASSETS.map(asset => {
            return cache.add(asset).catch(error => {
              console.warn(`⚠️ No se pudo cachear ${asset}:`, error);
              return Promise.resolve(); // Continuar aunque falle uno
            });
          })
        );
      })
      .then(() => {
        console.log("✅ Instalación completada");
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

// Estrategia de cache mejorada
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Evitar extensiones de desarrollo
  if (url.href.includes('chrome-extension') || url.href.includes('__webpack')) {
    return;
  }

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
        .catch(async () => {
          // Si falla la red, intentamos servir desde cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si no hay en cache, devolver error genérico para API
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Modo offline - Datos no disponibles" 
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Para navegación (SPA) - siempre servir index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request);
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Para recursos estáticos (Cache First)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Devolver desde cache si existe
        if (response) {
          return response;
        }

        // Si no está en cache, buscar en la red
        return fetch(request)
          .then((response) => {
            // Solo cachear respuestas válidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar respuesta para cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback para imágenes
            if (request.destination === 'image') {
              return caches.match('/icons/icon-192x192.png');
            }
            
            // Para otros recursos, intentar devolver algo del cache
            return caches.match(request);
          });
      })
  );
});

// Manejar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});