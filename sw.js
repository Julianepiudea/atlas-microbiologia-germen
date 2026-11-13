/* Service worker del Atlas GERMEN: precarga todo para uso sin conexión.
   Al cambiar archivos del sitio, sube VERSION para que los clientes se actualicen. */
const VERSION = 'germen-v1';
const THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
const PRECACHE = [
  './', 'index.html', 'manifest.webmanifest',
  'img/favicon.svg', 'img/germen-logo.png', 'img/icon-192.png', 'img/icon-512.png', 'img/icon-maskable-512.png', 'img/apple-touch-icon.png',
  'js/data1.js', 'js/data2.js', 'js/data3.js', 'js/mech1.js', 'js/mech2.js',
  'js/builders-bacteria.js', 'js/builders-other.js', 'js/walls.js', 'js/viewer-core.js',
  'js/lab-data.js', 'js/lab-core.js', 'js/lab-id.js', 'js/lab-ast.js', 'js/lab-mol.js', 'js/app.js', 'js/pwa.js',
  THREE + 'build/three.module.js',
  THREE + 'examples/jsm/controls/OrbitControls.js',
  THREE + 'examples/jsm/environments/RoomEnvironment.js',
  THREE + 'examples/jsm/utils/BufferGeometryUtils.js',
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Figtree:wght@400..700&family=Newsreader:ital,opsz,wght@1,6..72,400..600&family=JetBrains+Mono:wght@400..600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(PRECACHE.map(u =>
    fetch(new Request(u, {mode: u.startsWith('http') ? 'cors' : 'same-origin', cache: 'reload'}))
      .then(r => { if (!r.ok) throw new Error(u + ' ' + r.status); return fontsFrom(u, r.clone(), c).then(() => c.put(u, r)); })
  ))).then(() => self.skipWaiting()));
});

// Para la hoja de Google Fonts, precarga también los .woff2 que referencia
function fontsFrom(u, r, c) {
  if (!u.startsWith('https://fonts.googleapis.com/')) return Promise.resolve();
  return r.text().then(css => Promise.all((css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"]+/g) || [])
    .map(f => fetch(f, {mode: 'cors'}).then(fr => fr.ok && c.put(f, fr)).catch(() => {}))));
}

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const CACHEABLE = /^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  if (!same && !CACHEABLE.test(req.url)) return;

  // Navegación: red primero (contenido fresco), caché si no hay conexión
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r;
    }).catch(() => caches.match('index.html', {ignoreSearch: true})));
    return;
  }
  // Recursos: caché primero y actualización en segundo plano (fuentes y archivos locales)
  e.respondWith(caches.open(VERSION).then(c => c.match(req, {ignoreSearch: same}).then(hit => {
    const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  })));
});
