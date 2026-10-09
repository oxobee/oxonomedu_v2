// Oxonom EDU PWA Service Worker
const CACHE_NAME = 'oxonom-edu-pwa-v1'
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/oxonom-edu-logo.png',
  '/favicon.ico',
  '/m-login',
  '/m-admin',
]

// ── INSTALL ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Continue even if some individual assets fail to precache
      })
    })
  )
  self.skipWaiting()
})

// ── ACTIVATE ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// ── FETCH ──
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests, ignore chrome-extension / non-http
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return
  }

  // HTML page navigations -> Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached
            return caches.match('/m-login')
          })
        })
    )
    return
  }

  // Static assets (images, fonts, scripts, css) -> Stale-while-revalidate / Cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch and update cache in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse))
            }
          })
          .catch(() => {})
        return cachedResponse
      }

      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
