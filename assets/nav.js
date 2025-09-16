// assets/nav.js
(() => {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;

  // Abre/fecha o menu (mobile)
  function toggle(force) {
    const open = typeof force === 'boolean' ? force : !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  }

  btn.addEventListener('click', () => toggle());
  // Fecha ao clicar em um link
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) toggle(false);
  });
  // ESC fecha
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });
  // Em telas grandes, garante fechado
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) toggle(false);
  });

  // Destacar link atual
  const here = location.pathname.replace(/index\.html?$/i, '') || '/';
  [...nav.querySelectorAll('a')].forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/index\.html?$/i, '') || '/';
    // regra: se for "/", casa só com "/"; senão, começa com o caminho
    const match = href === '/' ? here === '/' : here.startsWith(href);
    if (match) a.classList.add('is-active');
  });

  // Ano no rodapé
  const yearEl = document.getElementById('ano');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})()