// assets/propush.js v3
(() => {
  // ===== CONFIG =====
  const ZONE_ID = '9865130';                 // seu zone id do ProPush
  const SW_PATH = '/sw-check-permissions-cf0e7.js'; // caminho do service worker enviado à raiz
  const DELAY_MS = 15000;                    // 15s
  const SCROLL_PCT = 0.50;                   // 50% de rolagem
  const COOLDOWN_H = 24;                     // só mostrar 1x a cada 24h
  const ASK_KEY = 'pp_nextAskAt';
  const DISMISS_KEY = 'pp_lastDismiss';

  // Só em páginas de post
  const isPost =
    location.pathname.includes('/posts/') ||
    /^\/posts\/[^/]+\.html$/i.test(location.pathname);

  // Suporte básico e estado da permissão
  if (!isPost) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'default') return; // já negado ou já permitido → não mostrar

  // Respeitar cooldown de 24h
  const now = Date.now();
  const next = +localStorage.getItem(ASK_KEY) || 0;
  if (now < next) return;

  let asked = false;
  let softShown = false;

  function setCooldown(hours = COOLDOWN_H) {
    localStorage.setItem(ASK_KEY, String(Date.now() + hours * 3600 * 1000));
  }

  function loadProPush(zoneId = ZONE_ID) {
    if (asked) return;
    asked = true;
    setCooldown(); // já conta como tentativa do dia
    const s = document.createElement('script');
    s.src = `https://yohle.com/d1d/f8c70/mw.min.js?z=${zoneId}&sw=${encodeURIComponent(SW_PATH)}`;
    s.async = true;
    s.onload = () => console.log('[propush] carregado');
    s.onerror = () => console.warn('[propush] erro ao carregar');
    document.head.appendChild(s);
  }

  function showSoftPrompt() {
    if (softShown || asked) return;
    softShown = true;

    const css = document.createElement('style');
    css.textContent = `
      #pp-soft{position:fixed;left:16px;right:16px;bottom:16px;background:#121212cc;color:#fff;
        border:1px solid #333;border-radius:14px;backdrop-filter:blur(4px);z-index:9999}
      #pp-soft .pp-wrap{display:flex;gap:12px;align-items:center;justify-content:space-between;
        padding:12px 14px;font:500 14px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
      #pp-soft button{cursor:pointer;border-radius:10px;padding:8px 12px;border:none}
      #pp-allow{background:#ff4d4f;color:#fff;font-weight:700}
      #pp-later{background:transparent;color:#ddd;border:1px solid #555}
      @media (max-width:480px){#pp-soft .pp-wrap{flex-direction:column;align-items:stretch}}
    `;
    document.head.appendChild(css);

    const bar = document.createElement('div');
    bar.id = 'pp-soft';
    bar.innerHTML = `
      <div class="pp-wrap">
        <span>Receba <b>novas receitas</b> e dicas de churrasco 🔔</span>
        <div style="display:flex;gap:8px">
          <button id="pp-allow">Ativar notificações</button>
          <button id="pp-later" class="pp-ghost">Agora não</button>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector('#pp-allow')?.addEventListener('click', () => {
      bar.remove();
      loadProPush();
    });
    bar.querySelector('#pp-later')?.addEventListener('click', () => {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      setCooldown(); // só volta a mostrar em 24h
      bar.remove();
    });
  }

  // Dispara o soft-prompt após 15s (se a aba estiver visível)
  setTimeout(() => {
    if (document.visibilityState === 'visible') showSoftPrompt();
  }, DELAY_MS);

  // Ou quando passar de 50% de rolagem
  let hit = false;
  function onScroll() {
    if (hit) return;
    const max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const scrolled = (window.scrollY + window.innerHeight) / max;
    if (scrolled >= SCROLL_PCT) {
      hit = true;
      showSoftPrompt();
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();