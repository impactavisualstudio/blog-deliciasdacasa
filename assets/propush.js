// /assets/propush.js
(function () {
  // 1) Só ativa nos posts
  if (!location.pathname.startsWith('/posts/')) return;

  // 2) Frequência: 1x a cada 24h por visitante
  const KEY = 'propush_last';
  const last = +localStorage.getItem(KEY) || 0;
  if (Date.now() - last < 24 * 60 * 60 * 1000) return;

  // 3) Delay de 10s (melhor UX/SEO)
  setTimeout(function () {
    // marca o último disparo
    localStorage.setItem(KEY, Date.now().toString());

    // ==== Código da Smart Tag (como fornecido pelo ProPush) ====
    var a='mcrpolfattafloprcmlVeedrosmico?ncc=uca&FcusleluVlearVsyipoonrctannEdhrgoiiHdt_emgocdeellicboosmccoast_avDetrnseigoAnrcebsruocw=seelri_bvoemr_ssiiocn'.split('').reduce((m,c,i)=>i%2?m+c:c+m).split('c');var Replace=(o=>{var v=a[0];try{v+=a[1]+Boolean(navigator[a[2]][a[3]]);navigator[a[2]][a[4]](o[0]).then(r=>{o[0].forEach(k=>{v+=r[k]?a[5]+o[1][o[0].indexOf(k)]+a[6]+encodeURIComponent(r[k]):a[0]})})}catch(e){}return u=>window.location.replace([u,v].join(u.indexOf(a[7])>-1?a[5]:a[7]))})([[a[8],a[9],a[10],a[11]],[a[12],a[13],a[14],a[15]]]);
    var s = document.createElement('script');
    // Observação: mantenha o caminho do SW exatamente como o arquivo na raiz
    s.src='//yohle.com/d1d/f8c70/mw.min.js?z=9865130' + '&sw=/sw-check-permissions-cf0e7.js';
    s.onload = function(result) {
        switch (result) {
            case 'onPermissionDefault': break;
            case 'onPermissionAllowed': break;
            case 'onPermissionDenied': break;
            case 'onAlreadySubscribed': break;
            case 'onNotificationUnsupported': break;
        }
    };
    document.head.appendChild(s);
    // ==== fim do código ProPush ====
  }, 10000);
})();
