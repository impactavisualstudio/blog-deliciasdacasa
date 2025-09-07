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
