/* ====== Delícias da Casa - script v7 ====== */

/* Ano automático no rodapé */
(function () {
  const anoEl = document.getElementById('ano');
  if (anoEl) anoEl.textContent = new Date().getFullYear();
})();

/* Cookie banner (exibe 1x) */
(function () {
  const banner = document.getElementById('cookie-banner');
  const btn = document.getElementById('aceitar-cookies');
  if (!banner || !btn) return;
  const KEY = 'cookies_ok_v1';
  if (!localStorage.getItem(KEY)) banner.style.display = 'flex';
  btn.addEventListener('click', () => {
    localStorage.setItem(KEY, '1');
    banner.remove();
  });
})();

/* AdSense init seguro (evita erro quando não há slots visíveis) */
window.addEventListener('load', () => {
  try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
});

/* Service Worker */
(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }
})();
/* Menu mobile (hambúrguer) */
(function(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });

  // Fecha ao clicar num link
  nav.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'a'){
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
})();
/* Menu mobile (abre/fecha) */
(function(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });

  // Fecha o menu ao clicar num link (experiência melhor no mobile)
  nav.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'a'){
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
})();

/* Barra de progresso de leitura */
(function () {
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  document.body.appendChild(bar);

  const update = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop || document.body.scrollTop);
    const height = h.scrollHeight - h.clientHeight;
    const pct = Math.max(0, Math.min(100, (scrolled / (height || 1)) * 100));
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* Respeita preferência de movimento reduzido */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = '*{transition:none!important;animation:none!important}';
    document.head.appendChild(style);
  }
})();

/* Injeta link "Receitas" no header se estiver faltando */
(function () {
  const onReady = () => {
    const nav = document.querySelector('.site-header .nav');
    if (!nav) return;
    const hasReceitas = Array.from(nav.querySelectorAll('a'))
      .some(a => (a.getAttribute('href') || '').replace(/\/+$/, '') === '/receitas.html'.replace(/\/+$/, ''));
    if (!hasReceitas) {
      const a = document.createElement('a');
      a.href = '/receitas.html';
      a.textContent = 'Receitas';
      const before = nav.querySelector('a[href="/sobre.html"]');
      nav.insertBefore(a, before || null);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();

/* === Sugestões de leitura rotativas (3 a cada 7s) === */
(function () {
  const DEBUG = false; // mude para true para ver logs no console
  const log = (...a) => DEBUG && console.log('[related]', ...a);
  const CDN = 'https://blog-deliciasdacasa.vercel.app';

  // Normaliza paths: remove domínio, 'index.html', '.html' e barra final
  const norm = (p) => (p || '/')
    .replace(/https?:\/\/[^/]+/i, '')
    .replace(/index\.html$/i, '')
    .replace(/\.html$/i, '')
    .replace(/\/+$/,'');
  const currentPath = () => norm(location.pathname);

  // Lista dos 12 posts (sem .html para bater com suas rotas)
  const POSTS = [
    { title: "Picanha perfeita: do sal grosso ao corte final", url: "/posts/churrasco-picanha-perfeito.html",         img: "/assets/images/picanha-1600.png" },
    { title: "Brisket texano: baixa temperatura, alto sabor",     url: "/posts/brisket-texano-lento.html.",           img: "/assets/images/brisket-1600.png" },
    { title: "Costela na brasa suculenta",                         url: "/posts/costela-na-brasa-suculenta.html",     img: "/assets/images/costela-1600.png" },
    { title: "Fraldinha marinada em 30 minutos",                   url: "/posts/fraldinha-marinada-rapida.html",      img: "/assets/images/fraldinha-1600.png" },
    { title: "Dry-aged: o que é e quando vale a pena",             url: "/posts/dry-aged-o-que-e.html",               img: "/assets/images/dryaged-1600.png" },
    { title: "Ancho: o rei do marmoreio",                          url: "/posts/ancho-marmoreio.html",                img: "/assets/images/ancho-marmoreio-hero.jpg" },
    { title: "T-bone e Porterhouse: diferença e preparo",          url: "/posts/tbone-porterhouse.html",              img: "/assets/images/tbone-porterhouse-hero.jpg" },
    { title: "Maminha: maciez acessível e cheia de sabor",         url: "/posts/maminha-churrasco.html",              img: "/assets/images/maminha-churrasco-hero.jpg" },
    { title: "Alcatra completa: versatilidade na grelha",          url: "/posts/alcatra-grelha.html",                 img: "/assets/images/alcatra-grelha-hero.jpg" },
    // Ajuste abaixo para os slugs reais dos posts 10–12
    { title: "Contrafilé clássico",                                url: "/posts/contrafile-brasa.html",               img: "/assets/images/contrafile-brasa-hero.jpg" },
    { title: "Cupim no fogo lento",                                url: "/posts/cupim-brasa.html",                    img: "/assets/images/cupim-brasa-hero.jpg" },
    { title: "Alcatra completa (guia)",                            url: "/posts/alcatra-grelha.html",                 img: "/assets/images/alcatra-grelha-hero.jpg" }
  ];

  function pickRandom(arr, n, excludeUrlNorm) {
    const pool = arr.filter(p => norm(p.url) !== excludeUrlNorm);
    if (pool.length === 0) return [];
    const res = [];
    const copy = pool.slice();
    while (res.length < n && copy.length) {
      const i = Math.floor(Math.random() * copy.length);
      res.push(copy.splice(i, 1)[0]);
    }
    return res;
  }

  function renderRelated() {
    const container = document.querySelector('.related-grid');
    if (!container) { log('container .related-grid não encontrado'); return; }
    container.setAttribute('aria-busy', 'true');

    const current = currentPath();
    log('pathname atual ->', current);

    let items = pickRandom(POSTS, 3, current);
    if (items.length === 0) { // fallback
      items = POSTS.slice(0, 3);
      log('fallback: usando primeiros 3');
    }

    container.innerHTML = items.map(p => {
      const imgSrc = p.img && p.img.startsWith('http') ? p.img : (CDN + p.img);
      return `
        <a class="related-card" href="${p.url}" aria-label="${p.title}">
          <figure>
            <img src="${imgSrc}" alt="${p.title}" loading="lazy" width="360" height="202">
            <figcaption>${p.title}</figcaption>
          </figure>
        </a>
      `;
    }).join('');

    container.setAttribute('aria-busy', 'false');
    log('sugestões renderizadas:', items.map(i => i.url));
  }

  function initRelated() {
    if (!document.getElementById('related-rotator')) {
      log('#related-rotator não existe nesta página');
      return;
    }
    renderRelated();
    setInterval(renderRelated, 7000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelated);
  } else {
    initRelated();
  }
})();
/* === Menu mobile === */
(function(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });

  // Fecha ao tocar num link
  nav.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'a'){
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
})();

/* === Cookie banner: empurra conteúdo p/ cima enquanto visível === */
(function () {
  const banner = document.getElementById('cookie-banner');
  const btn = document.getElementById('aceitar-cookies');
  if (!banner || !btn) return;
  const KEY = 'cookies_ok_v1';
  if (!localStorage.getItem(KEY)) {
    banner.style.display = 'flex';
    document.body.classList.add('has-cookie-banner');
  }
  btn.addEventListener('click', () => {
    localStorage.setItem(KEY, '1');
    banner.remove();
    document.body.classList.remove('has-cookie-banner');
  });
})();
