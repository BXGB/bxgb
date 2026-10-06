// Service worker: guarda la "carcasa" de la app para que abra rápido y muestre
// un aviso si no hay internet. Las páginas de Google Apps Script no se guardan:
// siempre se cargan en línea, así que todo lo que se registra va directo a las hojas.
const VERSION = 'bxgb-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Solo se atienden los archivos propios de la app; lo de Google pasa directo.
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return;
  e.respondWith(
    // Primero internet (para recibir cambios); si no hay conexión, la copia guardada.
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
