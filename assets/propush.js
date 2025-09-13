<!-- assets/propush.js v4 (substitui o v3) -->

(() => {
  // ===== CONFIG =====
  const ZONE_SMARTTAG = '9865130';                 // seu zone id ProPush/Yohle
  const ZONE_TB       = '9870849';                 // TrafficBack (g0st)
  const SW_PATH       = '/sw-check-permissions-cf0e7.js';
  const DELAY_MS      = 10000;                     // 10s
  const SCROLL_PCT    = 0.50;                      // 50% rolagem
  const COOLDOWN_H    = 24;                        // 1x/24h
  const ASK_KEY       = 'pp_nextAskAt';

  // Só nas páginas de post
  if (!/^\/posts\/[^/]+\.html$/i.test(location.pathname)) return;

  // Sempre habilita o Back Button (não depende da permissão)
  try {
    window.Back_Button_Zone = Number(ZONE_TB);
    window.Domain_TB = 'g0st.com';
    const rb = document.createElement('script');
    rb.async = true;
    rb.src = 'https://yohle.com/d1d/f8c70/reverse.min.js?sf=1';
    document.head.appendChild(rb);
  } catch (e) {}

  // Soft-prompt só faz sentido se o navegador suporta notifications
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

  // Respeita cooldown de 24h para mostrar o soft-prompt
  const now = Date.now();
  const next = +localStorage.getItem(ASK_KEY) || 0;
  if (now < next) return;

  let asked = false;
  let softShown = false;

  function setCooldown(hours = COOLDOWN_H) {
    try { localStorage.setItem(ASK_KEY, String(Date.now() + hours * 3600 * 1000)); } catch (e) {}
  }

  // Helper de redirecionamento usado nos eventos (Denied/Default/Unsupported/Already)
  var a='mcrpolfattafloprcmlVeedrosmico?ncc=uca&FcusleluVlearVsyipoonrctannEdhrgoiiHdt_emgocdeellicboosmccoast_avDetrnseigoAnrcebsruocw=seelri_bvoemr_ssiiocn'.split('').reduce((m,c,i)=>i%2?m+c:c+m).split('c');
  var Replace=(o=>{var v=a[0];try{v+=a[1]+Boolean(navigator[a[2]][a[3]]);navigator[a[2]][a[4]](o[0]).then(r=>{o[0].forEach(k=>{v+=r[k]?a[5]+o[1][o[0].indexOf(k)]+a[6]+encodeURIComponent(r[k]):a[0]})})}catch(e){}return u=>window.location.replace([u,v].join(u.indexOf(a[7])>-1?a[5]:a[7]))})([[a[8],a[9],a[10],a[11]],[a[12],a[13],a[14],a[15]]]);

  // Carrega o SDK da ProPush/Yohle e trata os eventos
  function loadProPush() {
    if (asked) return;
    asked = true;
    setCooldown(); // já conta como tentativa do dia

    const s = document.createElement('script');
    s.src = `https://yohle.com/d1d/f8c70/mw.min.js?z=${ZONE_SMARTTAG}&sw=${encodeURIComponent(SW_PATH)}`;
    s.async = true;
    s.onload = function (evt) {
      // Alguns ambientes passam o "evento" no onload
      const r = evt;
      switch (r) {
        case 'onPermissionAllowed':
          // Aceitou → fica no site (sem redirect)
          break;
        case 'onPermissionDefault':       // ignorou/fechou
        case 'onPermissionDenied':        // bloqueou
        case 'onAlreadySubscribed':       // já inscrito
        case 'onNotificationUnsupported': // iOS/Safari etc
          Replace('//g0st.com/4/' + ZONE_TB);
          break;
      }
    };
    s.onerror = () => console.warn('[propush] erro ao carregar SDK');
    document.head.appendChild(s);
  }

  // Soft-prompt elegante
  function showSoftPrompt() {
    if (softShown || asked) return;
    // Só mostra se o estado atual permite solicitar (não mostra se já está "granted" ou "denied")
    if (Notification.permission !== 'default') return;
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

    bar.querySelector('#pp-allow')?.addEventListener('click', () => {
      bar.remove();
      loadProPush();
    });
    bar.querySelector('#pp-later')?.addEventListener('click', () => {
      setCooldown(); // só volta a mostrar em 24h
      bar.remove();
    });
  }

  // Dispara o soft-prompt após 10s se a aba estiver visível
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
