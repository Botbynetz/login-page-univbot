// NEXUS Gaming Login - Service Worker
const CACHE_NAME = 'nexus-gaming-v1';
const urlsToCache = [
  '/',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Message from main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'ROCKET_LAUNCH') {
    // Preload resources for smooth animation
    console.log('🚀 Service Worker: Rocket launch detected, optimizing resources...');
  }
});