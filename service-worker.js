// Não cacheia HTML; cacheia só imagens. Versão nova
const CACHE = 'blog-carnes-v3';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 1) HTML: sempre rede de preferência
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2) Imagens: cache-first
  if (/\.(png|jpg|jpeg|webp|svg)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return res;
      }))
    );
    return;
  }

  // 3) Demais arquivos (CSS/JS): rede primeiro (respeita ?v=2)
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
