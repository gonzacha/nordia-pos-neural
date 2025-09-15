// Nordia POS Service Worker
const CACHE_NAME = 'nordia-pos-v1';

self.addEventListener('install', (event) => {
  console.log('Nordia POS SW: Installing...');
});

self.addEventListener('activate', (event) => {
  console.log('Nordia POS SW: Activated');
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through for now
  event.respondWith(fetch(event.request));
});