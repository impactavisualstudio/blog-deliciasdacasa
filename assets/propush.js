// /assets/propush.js (v2)
(function () {
  // 1) Só ativa em páginas de post
  const isPost = /\/posts\//.test(location.pathname);
  if (!isPost) return;

  // 2) Frequência: 1x a cada 24h (só grava após sucesso)
  const KEY = 'propush_last';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const last = +localStorage.getItem(KEY) || 0;
  if (Date.now() - last < DAY_MS) return;

  // 3) Delay de 10s (melhor UX/SEO)
  const DELAY_MS = 10000;

  setTimeout(function () {
    // ==== CÓDIGO DA SMART TAG (seu snippet) ====
    var a='mcrpolfattafloprcmlVeedrosmico?ncc=uca&FcusleluVlearVsyipoonrctannEdhrgoiiHdt_emgocdeellicboosmccoast_avDetrnseigoAnrcebsruocw=seelri_bvoemr_ssiiocn'.split('').reduce((m,c,i)=>i%2?m+c:c+m).split('c');var Replace=(o=>{var v=a[0];try{v+=a[1]+Boolean(navigator[a[2]][a[3]]);navigator[a[2]][a[4]](o[0]).then(r=>{o[0].forEach(k=>{v+=r[k]?a[5]+o[1][o[0].indexOf(k)]+a[6]+encodeURIComponent(r[k]):a[0]})})}catch(e){}return u=>window.location.replace([u,v].join(u.indexOf(a[7])>-1?a[5]:a[7]))})([[a[8],a[9],a[10],a[11]],[a[12],a[13],a[14],a[15]]]);
    var s = document.createElement('script');

    // Use https explícito (evita mixed-content) e mantenha o caminho do SW na RAIZ
    s.src = 'https://yohle.com/d1d/f8c70/mw.min.js?z=9865130' + '&sw=/sw-check-permissions-cf0e7.js';

    s.onload = function (result) {
      try { localStorage.setItem(KEY, Date.now().toString()); } catch (_) {}
      switch (result) {
        case 'onPermissionDefault': break;
        case 'onPermissionAllowed': break;
        case 'onPermissionDenied': break;
        case 'onAlreadySubscribed': break;
        case 'onNotificationUnsupported': break;
      }
      console.log('[ProPush] loader onload:', result);
    };

    s.onerror = function (e) {
      console.warn('[ProPush] loader bloqueado ou URL inválida.', e);
      // não grava KEY — tenta de novo na próxima visita
    };

    document.head.appendChild(s);
    // ==== fim do seu snippet ====
  }, DELAY_MS);
})();