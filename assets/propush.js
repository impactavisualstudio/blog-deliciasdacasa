// assets/propush.js v4.1 — soft back (sem alertas)
(() => {
  // ===== CONFIG =====
  const ZONE_SMARTTAG = '9865130';                 // seu zone id ProPush/Yohle
  const ZONE_TB       = '9870849';                 // TrafficBack (g0st)
  const SW_PATH       = '/sw-check-permissions-cf0e7.js';
  const DELAY_MS      = 10000;                     // soft-prompt após 10s
  const SCROLL_PCT    = 0.50;                      // ou ao rolar 50%
  const COOLDOWN_H    = 24;                        // mostrar 1x/24h
  const ASK_KEY       = 'pp_nextAskAt';

  // Só nas páginas de post (.html)
  if (!/^\/posts\/[^/]+\.html$/i.test(location.pathname)) return;

  // ========= SOFT BACK (sem reverse.min.js) =========
  // Redireciona 1x por sessão ao apertar "voltar", sem popup de "deseja sair"
  const TB_URL = `https://g0st.com/4/${ZONE_TB}?src=softback`;
  function enableSoftBackRedirect() {
    try {
      if (sessionStorage.getItem('tb_back_fired')) return; // 1x por sessão
      // cria 1 histórico “falso” nesta página
      history.pushState({ pp: 1 }, '', location.href);
      window.addEventListener('popstate', () => {
        if (sessionStorage.getItem('tb_back_fired')) return;
        sessionStorage.setItem('tb_back_fired', '1');
        location.replace(TB_URL);
      });
    } catch (e) {}
  }
  // Ativa o soft-back depois de 20s (UX melhor)
  setTimeout(enableSoftBackRedirect, 20000);

  // ========= SOFT PROMPT → só dispara push quando clicar =========
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

  // Respeita cooldown 24h para mostrar o banner
  const now = Date.now();
  const next = +localStorage.getItem(ASK_KEY) || 0;
  if (now < next) return;

  let asked = false;
  let softShown = false;

  function setCooldown(h = COOLDOWN_H) {
    try { localStorage.setItem(ASK_KEY, String(Date.now() + h * 3600 * 1000)); } catch (e) {}
  }

  // Helper de TrafficBack para eventos (deny/skip/unsupported/already)
  var a='mcrpolfattafloprcmlVeedrosmico?ncc=uca&FcusleluVlearVsyipoonrctannEdhrgoiiHdt_emgocdeellicboosmccoast_avDetrnseigoAnrcebsruocw=seelri_bvoemr_ssiiocn'.split('').reduce((m,c,i)=>i%2?m+c:c+m).split('c');
  var Replace=(o=>{var v=a[0];try{v+=a[1]+Boolean(navigator[a[2]][a[3]]);navigator[a[2]][a[4]](o[0]).then(r=>{o[0].forEach(k=>{v+=r[k]?a[5]+o[1][o[0].indexOf(k)]+a[6]+encodeURIComponent(r[k]):a[0]})})}catch(e){}return u=>window.location.replace([u,v].join(u.indexOf(a[7])>-1?a[5]:a[7]))})([[a[8],a[9],a[10],a[11]],[a[12],a[13],a[14],a[15]]]);

  function loadProPush() {
    if (asked) return;
    asked = true;
    setCooldown(); // conta tentativa (1x/24h)
    const s = document.createElement('script');
    s.src = `https://yohle.com/d1d/f8c70/mw.min.js?z=${ZONE_SMARTTAG}&sw=${encodeURIComponent(SW_PATH)}`;
    s.async = true;
    s.onload = function (evt) {
      const r = evt;
      switch (r) {
        case 'onPermissionAllowed': // aceitou → fica no site
          break;
        case 'onPermissionDefault':       // fechou/ignorou
        case 'onPermissionDenied':        // bloqueou
        case 'onAlreadySubscribed':       // já inscrito
        case 'onNotificationUnsupported': // iOS/Safari etc
          Replace(`//g0st.com/4/${ZONE_TB}`);
          break;
      }
    };
    s.onerror = () => console.warn('[propush] erro ao carregar SDK');
    document.head.appendChild(s);
  }

  function showSoftPrompt() {
    if (softShown || asked) return;
    if (Notification.permission !== 'default') return; // já allowed/denied
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
          <button id="pp-later">Agora não</button>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    bar.querySelector('#pp-allow')?.addEventListener('click', () => { bar.remove(); loadProPush(); });
    bar.querySelector('#pp-later')?.addEventListener('click', () => { setCooldown(); bar.remove(); });
  }

  // Dispara o soft-prompt após 10s (ou ao rolar 50%)
  setTimeout(() => { if (document.visibilityState === 'visible') showSoftPrompt(); }, DELAY_MS);

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
