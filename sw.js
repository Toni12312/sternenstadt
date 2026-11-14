// Sternenstadt – Offline-Speicher
const CACHE = 'sternenstadt-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Spiel selbst: zuerst aus dem Netz (damit Updates ankommen), sonst aus dem Speicher
  if (req.mode === 'navigate') {
    // cache: 'no-store' umgeht den Browser-Zwischenspeicher, damit wirklich die neueste Version kommt
    e.respondWith(fetch(req.url, { cache: 'no-store', credentials: 'same-origin' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
      return res;
    })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Update-Prüfung der App: immer direkt ins Netz
  if (new URL(req.url).searchParams.has('v')) return;
  // Alles andere (Symbole, Schrift): zuerst aus dem Speicher
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => hit)));
});
