// assets/propush.js v4.6 — auto-subscribe(granted) + soft-prompt (A/B) + 10s/50% + 1x/24h + 1x/sessão + In-Page fallback
(() => {
  // ====== CONFIG ======
  const ZONE_SMARTTAG = '9871244';                    // sua Smart Tag (push nativo/im-pd)
  const SW_PATH       = '/sw-check-permissions-ac32f.js';
  const DELAY_MS      = 10000;                        // 10s
  const SCROLL_PCT    = 0.50;                         // 50% de rolagem
  const COOLDOWN_H    = 24;                           // 1x/24h
  const ASK_KEY       = 'pp_nextAskAt';               // cooldown (localStorage)
  const SESS_KEY      = 'pp_shown_session';           // 1x/sessão (sessionStorage)
  const AB_KEY        = 'pp_ab_variant';              // fixa variante A/B
  const ENABLE_INPAGE = true;                         // fallback iOS/Safari/negado

  // ====== GUARDS ======
  if (location.protocol !== 'https:') return;
  const supportsPush = ('Notification' in window) && ('serviceWorker' in navigator);

  // Onde o soft-ask pode aparecer (o arquivo carrega no site todo)
  // inclui /posts/, /produtos/ e também /receitas.html e /utensilios.html
  const PATH_CAN_ASK = /^(\/(posts|produtos)\/[^/]+\.html|\/(receitas|utensilios)\.html)$/i;
  const canAskHere = PATH_CAN_ASK.test(location.pathname);

  // ====== COOL­DOWN & SESSÃO ======
  const now = Date.now();
  const nextAsk = +localStorage.getItem(ASK_KEY) || 0;
  const sessionShown = sessionStorage.getItem(SESS_KEY) === '1';

  function setCooldown(h = COOLDOWN_H) {
    try { localStorage.setItem(ASK_KEY, String(Date.now() + h*3600*1000)); } catch {}
  }
  function markSession() {
    try { sessionStorage.setItem(SESS_KEY, '1'); } catch {}
  }

  // ====== AUTO-INSCRIÇÃO (se já está GRANTED) ======
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
      })
      .catch(()=>{});
    // já inscrito/em inscrição — não precisa mostrar soft-ask nesta sessão
    try { sessionStorage.setItem(SESS_KEY, '1'); } catch {}
    return;
  }

  // ====== FALLBACK: IN-PAGE (iOS/Safari, ou permissão negada) ======
  if (ENABLE_INPAGE && (!supportsPush || Notification.permission === 'denied')) {
    renderInPage();            // exibe In-Page
    return;                    // não segue com soft-ask
  }

  // ====== SAÍDA AQUI SE NÃO SUPORTA PUSH ======
  if (!supportsPush) return;

  // ====== NÃO REPETIR (página + cooldown + sessão) ======
  if (!canAskHere || now < nextAsk || sessionShown) return;

  // ====== A/B TEST da cópia do banner ======
  const VARIANTS = [
    { // A
      line: 'Receba <b>ofertas e utensílios</b> 1–2x/semana 🔔',
      allow: 'Ativar notificações',
      later: 'Agora não'
    },
    { // B
      line: 'Cupons + promoções de <b>utensílios</b> (1–2x/semana) 🔔',
      allow: 'Quero receber',
      later: 'Depois'
    }
  ];
  let ab = +localStorage.getItem(AB_KEY);
  if (Number.isNaN(ab) || ab < 0 || ab > 1) { ab = Math.random() < 0.5 ? 0 : 1; localStorage.setItem(AB_KEY, String(ab)); }
  const COPY = VARIANTS[ab];

  // ====== LOADER DO SDK ======
  let asked = false, softShown = false;
  function loadProPush() {
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

  // ====== SOFT-PROMPT (banner) ======
  function showSoftPrompt() {
    if (softShown || asked) return;
    if (Notification.permission !== 'default') { setCooldown(); markSession(); return; }
    softShown = true;
    markSession();

    if (!document.getElementById('pp-soft-css')) {
      const css = document.createElement('style');
      css.id = 'pp-soft-css';
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
    }

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
      setCooldown(); // volta só em 24h
      bar.remove();
    });
  }

  // ====== GATILHOS: 10s OU 50% SCROLL ======
  const trigger = () => showSoftPrompt();
  setTimeout(() => { if (document.visibilityState === 'visible') trigger(); }, DELAY_MS);

  let fired = false;
  function onScroll() {
    if (fired) return;
    const max = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight,  document.documentElement.offsetHeight
    );
    const scrolled = (window.scrollY + window.innerHeight) / max;
    if (scrolled >= SCROLL_PCT) {
      fired = true;
      trigger();
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ====== IN-PAGE: cola o snippet oficial da sua zona ======
  function renderInPage() {
    try {
      if (window.__inpageLoaded) return;

      // evita duplicar se já existir um script igual
      const already = Array.from(document.scripts).some(s =>
        (s.src || '').includes('forfrogadiertor.com/tag.min.js')
      );
      if (already) { window.__inpageLoaded = true; return; }

      // slot fixo no topo (pode trocar para outro local do layout)
      let slot = document.getElementById('inpage-slot');
      if (!slot) {
        slot = document.createElement('div');
        slot.id = 'inpage-slot';
        slot.style.cssText = 'position:sticky;top:0;z-index:9998;margin:0;padding:0';
        document.body.prepend(slot);
      }

      // === SNIPPET OFICIAL DA SUA ZONA IN-PAGE ===
      const s = document.createElement('script');
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      s.src = 'https://forfrogadiertor.com/tag.min.js';
      s.dataset.zone = '9886724';
      s.onload = () => { window.__inpageLoaded = true; };
      s.onerror = () => console.warn('[propush] in-page não carregou');
      slot.appendChild(s);
    } catch (e) {
      console.warn('in-page error', e);
    }
  }
})()