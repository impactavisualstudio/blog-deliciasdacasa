<!-- /assets/propush.js -->

(() => {
  // ===================== CONFIG =====================
  const ZONE_SMARTTAG = '9871244';            // sua Smart Tag (push Propush)
  const SW_PATH       = '/sw-check-permissions-ac32f.js';
  const COOLDOWN_H    = 24;                    // 1x/24h
  const ASK_KEY       = 'pp_nextAskAt';        // cooldown (localStorage)
  const SESS_KEY      = 'pp_shown_session';    // 1x/sessão (sessionStorage)

  // Gatilhos padrão (páginas internas)
  const DELAY_MS      = 10000;                 // 10s
  const SCROLL_PCT    = 0.50;                  // 50% rolagem

  // Home (index) — engajamento leve antes de pedir
  const HOME_MIN_SECONDS = 12;                 // tempo mínimo na home
  const HOME_SCROLL_MIN  = 0.30;               // 30% de rolagem na home

  // In-Page/soft-back desabilitados
  const ENABLE_INPAGE    = false;
  const ENABLE_SOFT_BACK = false;

  // ===================== GUARDS =====================
  if (location.protocol !== 'https:') return;
  const supportsPush = ('Notification' in window) && ('serviceWorker' in navigator);

  const path = location.pathname;
  const isHome = path === '/' || /\/index\.html$/i.test(path);
  const CAN_ASK_REGEX = /^(\/(posts|produtos)\/[^/]+\.html|\/(receitas|utensilios)\.html)$/i;
  const canAskHere = isHome || CAN_ASK_REGEX.test(path);

  // Pageviews por sessão (usado na regra da home)
  const pv = +(sessionStorage.getItem('pp_pv') || 0);
  try { sessionStorage.setItem('pp_pv', String(pv + 1)); } catch {}

  // Cooldown / sessão
  const now = Date.now();
  const nextAsk = +localStorage.getItem(ASK_KEY) || 0;
  const sessionShown = sessionStorage.getItem(SESS_KEY) === '1';
  function setCooldown(h = COOLDOWN_H){ try{ localStorage.setItem(ASK_KEY, String(Date.now() + h*3600*1000)); }catch{} }
  function markSession(){ try{ sessionStorage.setItem(SESS_KEY, '1'); }catch{} }

  // ================= SOFT-BACK (OFF) =================
  if (ENABLE_SOFT_BACK) {
    try {
      if (!sessionStorage.getItem('tb_back_flag')) {
        history.pushState({ pp: 1 }, '', location.href);
        setTimeout(() => {
          window.addEventListener('popstate', () => {
            if (sessionStorage.getItem('tb_back_flag')) return;
            sessionStorage.setItem('tb_back_flag', '1');
            // location.replace('https://seu-trafficback-aqui');
          });
        }, 20000);
      }
    } catch {}
  }

  // ===== Auto-inscrição se já está GRANTED =====
  if (supportsPush && Notification.permission === 'granted') {
    navigator.serviceWorker.ready
      .then(r => r.pushManager.getSubscription())
      .then(s => {
        if (!s) {
          const sdk = document.createElement('script');
          sdk.async = true;
          sdk.src = `https://im-pd.com/d1d/f8c70/mw.min.js?z=${ZONE_SMARTTAG}&sw=${encodeURIComponent(SW_PATH)}`;
          document.head.appendChild(sdk);
        }
      });
    try { sessionStorage.setItem(SESS_KEY, '1'); } catch {}
    return; // nada mais nessa sessão
  }

  // ===== Fallback In-Page — DESLIGADO =====
  if (!supportsPush || Notification.permission === 'denied') {
    return;
  }

  // ===== Anti-spam =====
  if (!canAskHere || now < nextAsk || sessionShown) return;

  // ================= A/B COPY (soft banner) =================
  const AB_KEY = 'pp_ab_variant';
  const VARIANTS = [
    { // A
      line: 'Receba <b>ofertas e utensílios</b> 1–2x/semana 🔔',
      allow: 'Ativar notificações',
      later: 'Agora não'
    },
    { // B
      line: 'Cupons e novidades de <b>churrasco</b> (semanal) 🔔',
      allow: 'Quero receber',
      later: 'Depois'
    }
  ];
  let ab = +localStorage.getItem(AB_KEY);
  if (Number.isNaN(ab) || ab < 0 || ab > 1) {
    ab = Math.random() < 0.5 ? 0 : 1;
    try { localStorage.setItem(AB_KEY, String(ab)); } catch {}
  }
  const COPY = VARIANTS[ab];

  // ================= Loader do SDK =================
  let asked = false, softShown = false;
  function loadProPush(){
    if (asked) return;
    asked = true;
    setCooldown();   // 1x/24h
    markSession();   // 1x/sessão
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://im-pd.com/d1d/f8c70/mw.min.js?z=${ZONE_SMARTTAG}&sw=${encodeURIComponent(SW_PATH)}`;
    s.onerror = () => console.warn('[propush] erro ao carregar SDK');
    document.head.appendChild(s);
  }

  // expõe para o CTA do index
  window.ppAsk = () => {
    if (Notification.permission === 'default') {
      loadProPush();
    } else {
      // se já negou/aceitou, respeita; não mostramos nada aqui
      setCooldown(); markSession();
    }
  };

  // ================= Soft-prompt (banner) =================
  function showSoftPrompt(){
    if (softShown || asked) return;
    if (Notification.permission !== 'default') { setCooldown(); markSession(); return; }
    softShown = true;
    markSession();

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
        <span>${COPY.line}</span>
        <div style="display:flex;gap:8px">
          <button id="pp-allow">${COPY.allow}</button>
          <button id="pp-later">${COPY.later}</button>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector('#pp-allow')?.addEventListener('click', () => {
      bar.remove();
      loadProPush();
    });
    bar.querySelector('#pp-later')?.addEventListener('click', () => {
      setCooldown();
      bar.remove();
    });
  }

  // ================= Gatilhos =================
  // Clique direto em qualquer elemento com [data-push-cta]
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-push-cta]');
    if (!btn) return;
    ev.preventDefault();
    window.ppAsk();
  }, { passive: false });

  // Regras:
  // - Páginas internas: 10s OU 50% scroll
  // - Home: pedir quando houver ENGajamento (tempo + scroll) OU 2+ páginas na sessão.
  const t0 = Date.now();
  let fired = false;

  function scrollProgress() {
    const max = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight,  document.documentElement.offsetHeight
    );
    return (window.scrollY + window.innerHeight) / max;
  }

  function tryAsk() {
    if (fired) return;
    if (!isHome) {
      // Regra padrão
      showSoftPrompt();
      fired = true;
      return;
    }
    // Regra HOME
    const seconds = (Date.now() - t0) / 1000;
    const scrolled = scrollProgress();
    const engaged = (seconds >= HOME_MIN_SECONDS && scrolled >= HOME_SCROLL_MIN) || (pv + 1) >= 2;
    if (engaged) {
      showSoftPrompt();
      fired = true;
    }
  }

  // time trigger
  setTimeout(() => { if (document.visibilityState === 'visible') tryAsk(); }, isHome ? HOME_MIN_SECONDS * 1000 : DELAY_MS);

  // scroll trigger
  function onScroll(){
    if (fired) return;
    const scrolled = scrollProgress();
    if (isHome) {
      const seconds = (Date.now() - t0) / 1000;
      if (seconds >= HOME_MIN_SECONDS && scrolled >= HOME_SCROLL_MIN) {
        tryAsk();
        window.removeEventListener('scroll', onScroll);
      }
    } else if (scrolled >= SCROLL_PCT) {
      tryAsk();
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

})();
