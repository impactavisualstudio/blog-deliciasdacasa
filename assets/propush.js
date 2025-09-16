<!-- /assets/propush.js -->

(() => {
  // ===== CONFIG =====
  const ZONE_SMARTTAG = '9871244';            // sua Smart Tag (push nativo Propush)
  const SW_PATH       = '/sw-check-permissions-ac32f.js';
  const DELAY_MS      = 10000;                 // 10s
  const SCROLL_PCT    = 0.50;                  // 50% de rolagem
  const COOLDOWN_H    = 24;                    // 1x a cada 24h
  const ASK_KEY       = 'pp_nextAskAt';        // cooldown (localStorage)
  const SESS_KEY      = 'pp_shown_session';    // 1x/sessão (sessionStorage)

  // IMPORTANTE: sem In-Page / sem redes paralelas
  const ENABLE_INPAGE = false;                 // <- deixa OFF (sem forfrogadiertor)
  const ENABLE_SOFT_BACK = false;              // opcional, recomendo OFF no site principal

  // ===== GUARDS =====
  if (location.protocol !== 'https:') return;
  const supportsPush = ('Notification' in window) && ('serviceWorker' in navigator);

  // Onde o soft-ask pode aparecer (script pode carregar no site todo)
  const PATH_CAN_ASK = /^(\/(posts|produtos)\/[^/]+\.html|\/(receitas|utensilios)\.html|\/index\.html)$/i;
  const canAskHere = PATH_CAN_ASK.test(location.pathname);

  // ===== Cooldown / sessão =====
  const now = Date.now();
  const nextAsk = +localStorage.getItem(ASK_KEY) || 0;
  const sessionShown = sessionStorage.getItem(SESS_KEY) === '1';
  function setCooldown(h = COOLDOWN_H){ try{ localStorage.setItem(ASK_KEY, String(Date.now() + h*3600*1000)); }catch{} }
  function markSession(){ try{ sessionStorage.setItem(SESS_KEY, '1'); }catch{} }

  // ===== (opcional) soft-back — desativado por padrão =====
  if (ENABLE_SOFT_BACK) {
    try {
      if (!sessionStorage.getItem('tb_back_flag')) {
        history.pushState({ pp: 1 }, '', location.href);
        setTimeout(() => {
          window.addEventListener('popstate', () => {
            if (sessionStorage.getItem('tb_back_flag')) return;
            sessionStorage.setItem('tb_back_flag', '1');
            // coloque aqui seu TrafficBack se realmente quiser usar
            // location.replace('https://g0st.com/4/9870849?src=softback');
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
    return; // já resolvido nesta sessão
  }

  // ===== Fallback In-Page — DESLIGADO =====
  if (!supportsPush || Notification.permission === 'denied') {
    // ENABLE_INPAGE = false => não injeta nada aqui
    return;
  }

  // ===== Anti-spam =====
  if (!canAskHere || now < nextAsk || sessionShown) return;

  // ===== Loader do SDK (Propush) =====
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
      #pp-allow{background:#ff4d4f;color:#fff;font-weight:700}
      #pp-later{background:transparent;color:#ddd;border:1px solid #555}
      @media (max-width:480px){#pp-soft .pp-wrap{flex-direction:column;align-items:stretch}}
    `;
    document.head.appendChild(css);

    const bar = document.createElement('div');
    bar.id = 'pp-soft';
    bar.innerHTML = `
      <div class="pp-wrap">
        <span>Receba <b>ofertas e utensílios</b> 1–2x/semana 🔔</span>
        <div style="display:flex;gap:8px">
          <button id="pp-allow">Ativar notificações</button>
          <button id="pp-later">Agora não</button>
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

  // ===== Gatilhos: 10s OU 50% de scroll =====
  setTimeout(() => { if (document.visibilityState === 'visible') showSoftPrompt(); }, DELAY_MS);

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

})();
