/* /assets/propush.js — GA4 + DEBUG + In-Page SAFE (iOS/Safari em produto/receitas) */
(() => {
  // ===== CONFIG GERAL =====
  const ZONE_SMARTTAG = '9871244';                // sua Smart Tag (ProPush)
  const SW_PATH       = '/sw-check-permissions-ac32f.js';

  // Cooldowns (home mais agressivo)
  const COOLDOWN_H_INDEX = 12;                    // volta em 12h na home
  const COOLDOWN_H_OTHER = 24;                    // 24h nas demais

  const ASK_KEY   = 'pp_nextAskAt';               // cooldown (localStorage)
  const SESS_KEY  = 'pp_shown_session';           // 1x/sessão (sessionStorage)
  const AB_KEY    = 'pp_ab_variant';              // fixa variante de copy

  // ===== IN-PAGE SAFE (somente iOS/Safari e só em páginas alvo) =====
  // ➜ ZONE_INPAGE é a sua zona *In-Page Push* oficial do ProPush (não é SmartTag).
  //    Se você já usava 9886724 para In-Page, mantenha. Senão, troque pelo ID da sua zona In-Page.
  const ENABLE_INPAGE_SAFARI = true;
  const ZONE_INPAGE          = '9886724';         // <-- sua zona In-Page
  const INPAGE_SRC           = 'https://forfrogadiertor.com/tag.min.js'; // src oficial que o painel te deu
  // Onde permitir In-Page (produto/receitas):
  const PATH_INPAGE = /^(\/(posts|produtos)\/[^/]+\.html|\/receitas\.html)$/i;

  // Sem soft-back por padrão
  const ENABLE_SOFT_BACK = false;

  // ===== GUARDS =====
  if (location.protocol !== 'https:') return;
  const supportsPush = ('Notification' in window) && ('serviceWorker' in navigator);

  // Onde pode pedir nativo (inclui INDEX)
  const isIndex    = /^(\/|\/index\.html)$/i.test(location.pathname);
  const canAskHereReal = /^(\/(posts|produtos)\/[^/]+\.html|\/(receitas|utensilios)\.html|\/index\.html|\/)$/i
                          .test(location.pathname);

  // Timings por contexto (home mais cedo / menos scroll)
  const DELAY_MS   = isIndex ? 6000 : 10000;
  const SCROLL_PCT = isIndex ? 0.30 : 0.50;

  // ===== Métricas (GA4/GTM) =====
  function dl(){ if (!window.dataLayer) window.dataLayer = []; return window.dataLayer; }
  function track(event, extra = {}) {
    try { dl().push({ event, ...extra }); } catch {}
    if (typeof console !== 'undefined' && console.debug) console.debug('[propush]', event, extra);
    window.ppLast = { event, ...extra, t: Date.now() };
  }
  let lastTrigger = null;
  const setTrigger = (t) => { lastTrigger = t; };

  // ===== DEBUG MODE =====
  const qs = new URLSearchParams(location.search);
  const DEBUG = qs.has('ppdebug') || localStorage.getItem('pp_debug') === '1';
  const DBG = {
    noCooldown : qs.get('d_nocd') === '1' || localStorage.getItem('pp_debug_nocd') === '1',
    anywhere   : qs.get('d_anywhere') === '1' || localStorage.getItem('pp_debug_anywhere') === '1',
    panel      : qs.get('d_panel') === '1' || localStorage.getItem('pp_debug_panel') === '1',
    forceTrig  : qs.get('d_trigger') || '',          // 'timer'|'scroll'|'exit'|'nudge'|'ask'
    forceAB    : qs.has('d_ab') ? Number(qs.get('d_ab')) : null, // 0|1
    autoShow   : qs.get('d_auto') === '1',
    forceShow  : qs.get('d_show') === '1',
    forceAsk   : qs.get('d_ask') === '1',
  };
  if (DEBUG) track('pp_debug_on', { ...DBG, path: location.pathname });

  // ===== Cooldown / sessão =====
  const now          = Date.now();
  let nextAsk        = +localStorage.getItem(ASK_KEY) || 0;
  let sessionShown   = sessionStorage.getItem(SESS_KEY) === '1';

  function shouldThrottle() {
    if (DEBUG && DBG.noCooldown) return false;
    return (now < nextAsk) || sessionShown;
  }
  function setCooldown(hours) {
    const h = (typeof hours === 'number' ? hours : (isIndex ? COOLDOWN_H_INDEX : COOLDOWN_H_OTHER));
    try { localStorage.setItem(ASK_KEY, String(Date.now() + h*3600*1000)); } catch {}
    track('pp_cooldown_set', { hours: h });
  }
  function clearThrottle() {
    try { localStorage.removeItem(ASK_KEY); } catch {}
    try { sessionStorage.removeItem(SESS_KEY); } catch {}
    nextAsk = 0; sessionShown = false;
    track('pp_cooldown_cleared');
  }
  function markSession(){ try { sessionStorage.setItem(SESS_KEY, '1'); } catch{} }

  // ===== (opcional) soft-back — OFF por padrão =====
  if (ENABLE_SOFT_BACK) {
    try {
      if (!sessionStorage.getItem('tb_back_flag')) {
        history.pushState({pp:1}, '', location.href);
        setTimeout(() => {
          window.addEventListener('popstate', () => {
            if (sessionStorage.getItem('tb_back_flag')) return;
            sessionStorage.setItem('tb_back_flag','1');
            track('pp_softback_fired');
            // location.replace('https://g0st.com/4/SEU_TB?src=softback');
          });
        }, 20000);
      }
    } catch {}
  }

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
  if (Number.isNaN(ab) || ab < 0 || ab > 1) ab = Math.random() < 0.5 ? 0 : 1;
  if (DEBUG && (DBG.forceAB === 0 || DBG.forceAB === 1)) {
    ab = DBG.forceAB;
    try { localStorage.setItem(AB_KEY, String(ab)); } catch {}
  } else {
    try { localStorage.setItem(AB_KEY, String(ab)); } catch {}
  }
  track('pp_variant', { ab });

  // ===== Detectar iOS/Safari p/ In-Page SAFE =====
  const ua       = navigator.userAgent || '';
  const isIOS    = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /\bSafari\//.test(ua) && !/(Chrome|CriOS|FxiOS|OPR|EdgiOS)/i.test(ua);
  const allowInPage = ENABLE_INPAGE_SAFARI && isIOS && isSafari &&
                      (PATH_INPAGE.test(location.pathname) || (DEBUG && DBG.anywhere));

  // ===== Função para renderizar In-Page SAFE =====
  function renderInPage() {
    if (!ZONE_INPAGE || !INPAGE_SRC) return;
    if (document.getElementById('inpage-slot')) return;

    const css = document.createElement('style');
    css.textContent = `
      #inpage-slot{position:sticky;bottom:0;z-index:9998}
      @media (max-width:480px){#inpage-slot{position:fixed;left:0;right:0;bottom:0}}
    `;
    document.head.appendChild(css);

    const slot = document.createElement('div');
    slot.id = 'inpage-slot';
    document.body.appendChild(slot);

    // tag oficial da zona In-Page (apenas para iOS/Safari)
    const s = document.createElement('script');
    s.async = true;
    s.src = INPAGE_SRC;
    s.dataset.zone = ZONE_INPAGE; // vira data-zone="..."
    s.onload  = () => track('pp_inpage_loaded',  { zone: ZONE_INPAGE });
    s.onerror = () => track('pp_inpage_error',   { zone: ZONE_INPAGE });
    slot.appendChild(s);

    // Fallback visual simples (se bloqueado)
    setTimeout(() => {
      const anyScript = slot.querySelector('script[src*="tag.min.js"]');
      if (!anyScript) {
        const fb = document.createElement('div');
        fb.style.cssText = 'background:#111;color:#fff;border-top:1px solid #333;padding:10px 14px;font:500 14px/1.3 system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
        fb.innerHTML = '🔔 Receba ofertas rápidas — ative notificações no Android/Chrome para não perder promoções.';
        slot.appendChild(fb);
      }
    }, 1500);
  }

  // ===== Auto-inscrição se já está GRANTED (nativo) =====
  if (supportsPush && Notification.permission === 'granted' && !(DEBUG && DBG.forceShow)) {
    navigator.serviceWorker.ready
      .then(r => r.pushManager.getSubscription())
      .then(s => {
        track('pp_granted_page_load', { hasSub: !!s });
        if (!s) {
          const sdk = document.createElement('script');
          sdk.async = true;
          sdk.src = `https://im-pd.com/d1d/f8c70/mw.min.js?z=${ZONE_SMARTTAG}&sw=${encodeURIComponent(SW_PATH)}`;
          sdk.onload  = () => track('pp_sdk_injected', { reason: 'auto_granted' });
          sdk.onerror = () => track('pp_sdk_error',    { reason: 'auto_granted' });
          document.head.appendChild(sdk);
        }
      });
    try { sessionStorage.setItem(SESS_KEY, '1'); } catch {}
    if (!(DEBUG && DBG.forceShow)) return; // sessão já resolvida
  }

  // ===== Se iOS/Safari elegível p/ In-Page SAFE, usa In-Page e encerra =====
  if (allowInPage) {
    track('pp_inpage_start', { path: location.pathname });
    renderInPage();
    return; // não mostra soft-prompt nativo
  }

  // ===== Gating nativo (com exceções em DEBUG) =====
  const canAskHere = canAskHereReal || (DEBUG && DBG.anywhere);
  if ((!supportsPush || Notification.permission === 'denied' || !canAskHere) && !(DEBUG && (DBG.forceShow || DBG.anywhere))) {
    track('pp_not_eligible', { supportsPush, perm: Notification.permission, canAskHere });
    return;
  }
  if (shouldThrottle() && !(DEBUG && DBG.noCooldown)) {
    track('pp_throttled', { nextAsk, sessionShown });
    return; // anti-spam
  }

  // ===== Loader do SDK nativo =====
  let asked = false, softShown = false;
  function loadProPush(){
    if (asked) return;
    asked = true;
    setCooldown();           // 12h na home / 24h nas demais
    markSession();           // 1x/sessão
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://im-pd.com/d1d/f8c70/mw.min.js?z=${ZONE_SMARTTAG}&sw=${encodeURIComponent(SW_PATH)}`;
    s.onload  = () => track('pp_sdk_injected', { trigger: lastTrigger || 'manual', ab });
    s.onerror = () => track('pp_sdk_error',    { trigger: lastTrigger || 'manual', ab });
    document.head.appendChild(s);
  }

  // Expor gatilhos manuais (usados no index)
  window.ppAsk  = () => { setTrigger('manual'); track('pp_manual_click', { ab }); loadProPush(); };
  window.ppOpen = window.ppAsk;
  window.ppNudge = () => { setTrigger('manual'); track('pp_nudge', { ab }); showSoftPrompt(); };

  // ===== Soft-prompt (banner) =====
  function showSoftPrompt(){
    if (softShown || asked) return;
    if (Notification.permission !== 'default' && !(DEBUG && DBG.forceShow)) { setCooldown(); markSession(); return; }
    softShown = true;
    markSession();

    track('pp_soft_shown', { trigger: lastTrigger || 'unknown', ab, isIndex });

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
        <span>${VARIANTS[ab].line}</span>
        <div style="display:flex;gap:8px">
          <button id="pp-allow">${VARIANTS[ab].allow}</button>
          <button id="pp-later">${VARIANTS[ab].later}</button>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector('#pp-allow')?.addEventListener('click', () => {
      track('pp_click_allow', { trigger: lastTrigger || 'unknown', ab });
      bar.remove();
      loadProPush();
    });
    bar.querySelector('#pp-later')?.addEventListener('click', () => {
      track('pp_click_later', { trigger: lastTrigger || 'unknown', ab });
      setCooldown(); // aplica 12h/24h conforme página
      bar.remove();
    });
  }

  // ===== Gatilhos: tempo, scroll e exit-intent desktop =====
  setTimeout(() => {
    if (document.visibilityState === 'visible') {
      setTrigger('timer');
      track('pp_trigger_timer', { isIndex });
      showSoftPrompt();
    }
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
      setTrigger('scroll');
      track('pp_trigger_scroll', { pct: SCROLL_PCT });
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
        setTrigger('exit');
        track('pp_trigger_exit');
        showSoftPrompt();
      }
    }, { passive: true });
  }

  // ===== DEBUG helpers (API + painel opcional) =====
  function debugStatus() {
    return {
      DEBUG, DBG, ab, isIndex, canAskHereReal,
      supportsPush, permission: Notification && Notification.permission,
      nextAsk: +localStorage.getItem(ASK_KEY) || 0,
      sessionShown: sessionStorage.getItem(SESS_KEY) === '1'
    };
  }
  window.ppDebug = {
    enable()      { localStorage.setItem('pp_debug','1'); location.reload(); },
    disable()     { localStorage.removeItem('pp_debug');  location.reload(); },
    status()      { const s = debugStatus(); console.table(s); return s; },
    clear()       { clearThrottle(); },
    show()        { setTrigger('manual_debug'); showSoftPrompt(); },
    ask()         { setTrigger('manual_debug'); loadProPush(); },
    setAB(n=0)    { n=+n; if(n===0||n===1){ localStorage.setItem(AB_KEY,String(n)); location.reload(); } },
    noCooldown(on=true){ localStorage.setItem('pp_debug_nocd', on?'1':'0'); location.reload(); },
    anywhere(on=true)  { localStorage.setItem('pp_debug_anywhere', on?'1':'0'); location.reload(); },
    panel(on=true)     { localStorage.setItem('pp_debug_panel', on?'1':'0'); location.reload(); },
    cooldown(h)  { setCooldown(+h||0); },
  };

  if (DEBUG && (qs.get('d_panel')==='1' || localStorage.getItem('pp_debug_panel')==='1')) {
    const css = document.createElement('style');
    css.textContent = `
      #pp-debug { position: fixed; right: 12px; bottom: 12px; z-index: 99999;
        background: #111; color: #fff; border: 1px solid #444; border-radius: 10px; padding: 10px;
        font: 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      #pp-debug b{color:#9ef}
      #pp-debug .row{display:flex;gap:6px;margin-top:8px}
      #pp-debug button{background:#333;color:#fff;border:1px solid #555;border-radius:8px;padding:6px 8px;cursor:pointer}
      #pp-debug .tiny{opacity:.7}
    `;
    document.head.appendChild(css);

    const box = document.createElement('div');
    box.id = 'pp-debug';
    const s = debugStatus();
    box.innerHTML = `
      <div><b>PP DEBUG</b> — ab:${ab} perm:${s.permission} <span class="tiny">(${isIndex?'home':'outra'})</span></div>
      <div class="row">
        <button id="ppd-soft">Soft</button>
        <button id="ppd-ask">Ask</button>
        <button id="ppd-clear">Clear</button>
        <button id="ppd-variant">AB↔</button>
        <button id="ppd-close">×</button>
      </div>
    `;
    document.body.appendChild(box);

    box.querySelector('#ppd-soft') .onclick = ()=>{ setTrigger('panel'); showSoftPrompt(); };
    box.querySelector('#ppd-ask')  .onclick = ()=>{ setTrigger('panel'); loadProPush();   };
    box.querySelector('#ppd-clear').onclick = ()=>{ clearThrottle(); alert('Cooldown/sessão limpos'); };
    box.querySelector('#ppd-variant').onclick = ()=>{
      const nv = ab===0?1:0; localStorage.setItem(AB_KEY, String(nv)); location.reload();
    };
    box.querySelector('#ppd-close').onclick = ()=> box.remove();
  }

  // Ações imediatas de debug via query
  if (DEBUG) {
    if (DBG.noCooldown) clearThrottle();
    if (DBG.forceShow)  { setTrigger(DBG.forceTrig||'debug'); setTimeout(showSoftPrompt, 80); }
    if (DBG.forceAsk)   { setTrigger(DBG.forceTrig||'debug'); setTimeout(loadProPush, 50); }
    if (DBG.autoShow)   { setTrigger(DBG.forceTrig||'debug'); setTimeout(showSoftPrompt, 250); }
  }
})();
