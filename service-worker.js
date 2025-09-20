// service-worker.js

// ====== ProPush dentro do MESMO SW (recomendado) ======
// (deixe este import no topo ou no final do arquivo; aqui vai no topo)
try {
  // ajuste o z= para a sua zona se um dia mudar
  importScripts('https://im-pd.com/sw/worker.js?z=9871244');
} catch (e) {
  // apenas log de depuração (não quebra o SW se offline)
  console.warn('Falha ao importar ProPush SW:', e);
}

// ====== Seu SW de cache/app ======
const CACHE = 'dc-v6'; // <— bump para forçar atualização

// Shell básico do app
const CORE = [
  '/', '/index.html',
  '/assets/styles.css?v=2',
  '/assets/script.js?v=4',
  '/assets/posts.js?v=10',
];

// Imagens que você quer que funcionem OFFLINE já no 1º load
const PRECACHE_IMAGES = [
  '/assets/images/bg-embers.png',
  '/assets/images/hero-picanha-1600.png',
  '/assets/images/brisket-1600.png',
  '/assets/images/costela-1600.png',
  '/assets/images/fraldinha-1600.png',
  '/assets/images/chorizo-argentino-hero.jpg',
  '/assets/images/alcatra-grelha-hero.jpg',
  '/assets/images/contrafile-brasa-hero.jpg',
  '/assets/images/cupim-brasa-hero.jpg',
  '/assets/images/tbone-porterhouse-hero.jpg',
  '/assets/images/ancho-marmoreio-hero.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([...CORE, ...PRECACHE_IMAGES]))
  );
  // toma controle sem esperar navegações fecharem
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // controla imediatamente todas as abas da origem
  self.clients.claim();
});

// Domínios de anúncios: não intercepta (evita erro em dev)
const ADS_HOSTS = new Set([
  'pagead2.googlesyndication.com',
  'googleads.g.doubleclick.net',
  'tpc.googlesyndication.com',
  'adservice.google.com',
  'adservice.google.com.br',
  'g.doubleclick.net',
]);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // deixa anúncios irem direto pra rede
  if (ADS_HOSTS.has(url.hostname)) {
    e.respondWith(fetch(req));
    return;
  }

  // navegação: network-first com fallback pro index
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }

  // imagens: cache-first; se não tiver no cache e estiver offline, usa fallback
  if (url.pathname.startsWith('/assets/images/')) {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('/assets/images/hero-picanha-1600.png')))
    );
    return;
  }

  // demais: network, e se falhar usa cache
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
Depois de atualizar
