// Ano automático
const anoEl = document.getElementById('ano');
if (anoEl) anoEl.textContent = new Date().getFullYear();

// Cookie banner
(function(){
  const banner = document.getElementById('cookie-banner');
  const btn = document.getElementById('aceitar-cookies');
  if(!banner || !btn) return;
  const key = 'cookies_ok_v1';
  if(!localStorage.getItem(key)) banner.style.display = 'flex';
  btn.addEventListener('click', ()=>{ localStorage.setItem(key,'1'); banner.remove(); });
})();

// AdSense safe init
window.addEventListener('load', ()=>{
  try{ (adsbygoogle = window.adsbygoogle || []).push({}); }catch(e){}
});

// Service Worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').catch(()=>{});
}

// Reading progress
(function(){
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop || document.body.scrollTop);
    const height = h.scrollHeight - h.clientHeight;
    const pct = Math.max(0, Math.min(100, (scrolled/height)*100));
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
  update();
})();

// Reduced motion
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const style = document.createElement('style');
  style.textContent = '*{transition:none!important;animation:none!important}';
  document.head.appendChild(style);
}
<script>
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.site-header .nav');
  if (!nav) return;

  const hasReceitas = Array.from(nav.querySelectorAll('a'))
    .some(a => a.getAttribute('href') === '/receitas.html');

  if (!hasReceitas) {
    const a = document.createElement('a');
    a.href = '/receitas.html';
    a.textContent = 'Receitas';
    nav.insertBefore(a, nav.querySelector('a[href="/sobre.html"]') || null);
  }
});
</script>
// === Sugestões de leitura rotativas (3 a cada 7s) ===
(function () {
  const CDN = "https://blog-carnes.vercel.app";
  // Lista dos 12 posts (ajuste títulos/paths se quiser)
  const POSTS = [
    { title: "Picanha perfeita: do sal grosso ao corte final", url: "/posts/churrasco-picanha-perfeito.html", img: "/assets/images/picanha-1600.png" },
    { title: "Brisket texano: baixa temperatura, alto sabor", url: "/posts/brisket-texano.html", img: "/assets/images/brisket-texano-hero.jpg" },
    { title: "Costela na brasa suculenta", url: "/posts/costela-na-brasa-suculenta.html", img: "/assets/images/costela-fogo-chao-hero.jpg" },
    { title: "Fraldinha marinada em 30 minutos", url: "/posts/fraldinha-marinada-rapida.html", img: "/assets/images/fraldinha-marinada-hero.jpg" },
    { title: "Dry-aged: o que é e quando vale a pena", url: "/posts/dry-aged-o-que-e.html", img: "/assets/images/dryaged-carne-hero.jpg" },
    { title: "Ancho: o rei do marmoreio", url: "/posts/ancho-marmoreio.html", img: "/assets/images/ancho-marmoreio-hero.jpg" },
    { title: "T-bone e Porterhouse: diferença e preparo", url: "/posts/tbone-porterhouse.html", img: "/assets/images/tbone-porterhouse-hero.jpg" },
    { title: "Maminha: maciez acessível e cheia de sabor", url: "/posts/maminha-churrasco.html", img: "/assets/images/maminha-churrasco-hero.jpg" },
    { title: "Alcatra completa: versatilidade na grelha", url: "/posts/alcatra-grelha.html", img: "/assets/images/alcatra-grelha-hero.jpg" },
    // Ajuste estes três para os posts 10–12 que você já tem publicados:
    { title: "Contrafilé clássico", url: "/posts/contrafile-classico.html", img: "/assets/images/contrafile-classico-hero.jpg" },
    { title: "Cupim no fogo lento", url: "/posts/cupim-fogo-lento.html", img: "/assets/images/cupim-fogo-lento-hero.jpg" },
    { title: "Alcatra completa na grelha (guia)", url: "/posts/alcatra-completa.html", img: "/assets/images/alcatra-completa-hero.jpg" }
  ];

  function pickRandom(arr, n, excludeUrl) {
    const pool = arr.filter(p => p.url !== excludeUrl);
    const res = [];
    while (res.length < n && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      res.push(pool.splice(i, 1)[0]);
    }
    return res;
  }

  function renderRelated() {
    const container = document.querySelector(".related-grid");
    if (!container) return;
    container.setAttribute("aria-busy", "true");
    const current = location.pathname.replace(/\/+$/, "");
    const items = pickRandom(POSTS, 3, current);
    container.innerHTML = items.map(p => `
      <a class="related-card" href="${p.url}" aria-label="${p.title}">
        <figure>
          <img src="${p.img.startsWith('http') ? p.img : (CDN + p.img)}" alt="${p.title}" loading="lazy" width="360" height="202">
          <figcaption>${p.title}</figcaption>
        </figure>
      </a>
    `).join("");
    container.setAttribute("aria-busy", "false");
  }

  // Inicializa e rotaciona a cada 7s
  if (document.getElementById("related-rotator")) {
    renderRelated();
    setInterval(renderRelated, 7000);
  }
})();
