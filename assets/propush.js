(() => {
  // ===== CONFIG =====
  const ZONE_SMARTTAG = '9871244';                    // sua Smart Tag (Propush)
  const SW_PATH       = '/sw-check-permissions-ac32f.js';
  const COOLDOWN_H    = 24;                           // 1x/24h
  const ASK_KEY       = 'pp_nextAskAt';               // cooldown (local)
  const SESS_KEY      = 'pp_shown_session';           // 1x/sessão (session)
  const AB_KEY        = 'pp_ab_variant';              // fixa variante de copy

  // Sem In-Page / sem tráfego extra
  const ENABLE_INPAGE    = false;
  const ENABLE_SOFT_BACK = false;

  // ===== GUARDS =====
  if (location.protocol !== 'https:') return;
  const supportsPush = ('Notification' in window) && ('serviceWorker' in navigator);

  // Onde pode pedir (inclui INDEX)
  const isIndex     = /^(\/|\/index\.html)$/i.test(location.pathname);
  const canAskHere  = /^(\/(posts|produtos)\/[^/]+\.html|\/(receitas|utensilios)\.html|\/index\.html|\/)$/i
                        .test(location.pathname);

  // Timings por contexto
  const DELAY_MS   = isIndex ? 6000 : 10000;          // 6s no index, 10s nos demais
  const SCROLL_PCT = isIndex ? 0.30 : 0.50;           // 30% no index, 50% nos demais

  // ===== Cooldown / sessão =====
  const now          = Date.now();
  const nextAsk      = +localStorage.getItem(ASK_KEY) || 0;
  const sessionShown = sessionStorage.getItem(SESS_KEY) === '1';

  const setCooldown = (h = COOLDOWN_H) => { try {
    localStorage.setItem(ASK_KEY, String(Date.now() + h*3600*1000));
  } catch{} };

  const markSession = () => { try { sessionStorage.setItem(SESS_KEY, '1'); } catch{} };

  // ===== (opcional) soft-back — OFF por padrão =====
  if (ENABLE_SOFT_BACK) {
    try {
      if (!sessionStorage.getItem('tb_back_flag')) {
        history.pushState({pp:1}, '', location.href);
        setTimeout(() => {
          window.addEventListener('popstate', () => {
            if (sessionStorage.getItem('tb_back_flag')) return;
            sessionStorage.setItem('tb_back_flag','1');
            // location.replace('https://g0st.com/4/SEU_TB?src=softback');
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
    return; // sessão já resolvida
  }

  // ===== In-Page OFF (nada a fazer se negado ou sem suporte) =====
  if (!supportsPush || Notification.permission === 'denied' || !canAskHere) return;
  if (now < nextAsk || sessionShown) return; // anti-spam

  // ===== A/B copy (fixa por usuário) =====
  const VARIANTS = [
    { // A: ofertas
      line: 'Receba <b>ofertas e utensílios</b> 1–2x/semana 🔔',
      allow: 'Ativar notificações',
      later: 'Agora não'
    },
    { // B: receitas
      line: 'Novas <b>receitas e dicas</b> direto no seu aparelho 🔔',
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

  // ===== Loader do SDK =====
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
  // gatilho manual opcional (botão no index)
  window.ppAsk   = loadProPush;

  // ===== Soft-prompt (banner) =====
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
      #pp-allow{font-weight:700;background:#ff4d4f;color:#fff}
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
  window.ppNudge = showSoftPrompt;  // também expõe o “nudge”

  // ===== Gatilhos: tempo, scroll e exit-intent desktop =====
  setTimeout(() => {
    if (document.visibilityState === 'visible') showSoftPrompt();
  }, DELAY_MS);

  let fired = false;
  function onScroll(){
    if (fired) return;
    const max = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight,  document.documentElement.offsetHeight
    );
    const scrolled = (window.scrollY + window.innerHeight) / max;
    if (scrolled >= SCROLL_PCT) {
      fired = true;
      showSoftPrompt();
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Exit-intent (somente desktop)
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (!isMobile) {
    let exitUsed = false;
    document.addEventListener('mouseout', (e) => {
      if (exitUsed || softShown || asked) return;
      if (e.clientY <= 0 && document.visibilityState === 'visible') {
        exitUsed = true;
        showSoftPrompt();
      }
    }, { passive: true });
  }
})();

