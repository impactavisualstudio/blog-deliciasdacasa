// Comentários – front-end
// Use em /assets/comments.js (ou cole no fim do /assets/script.js)

(() => {
  // Em localhost usa a API hospedada no seu domínio de produção.
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const API_BASE = isLocal ? 'https://blog-deliciasdacasa.vercel.app' : '';
  const API = `${API_BASE}/api/comments`;

  const slug = location.pathname; // ex.: /posts/costela-na-brasa-suculenta.html
  const list = document.getElementById('comment-list');
  const form = document.getElementById('comment-form');

  // Se a página não tem a seção de comentários, não faz nada.
  if (!list && !form) return;

  const escapeHtml = (s) =>
    String(s || '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  const itemHTML = (it) => {
    const d = new Date(it.created_at);
    const when = d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    return `<li>
      <div class="comment-meta">${escapeHtml(it.name)} • ${when}</div>
      <div>${escapeHtml(it.body)}</div>
    </li>`;
  };

  async function load() {
    if (!list) return;
    list.innerHTML = '<li>Carregando…</li>';
    try {
      const res = await fetch(`${API}?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      list.innerHTML =
        Array.isArray(data) && data.length
          ? data.map(itemHTML).join('')
          : '<li>Seja o primeiro a comentar!</li>';
    } catch {
      list.innerHTML = '<li>Não foi possível carregar os comentários.</li>';
    }
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      slug,
      name: String(fd.get('name') || '').trim().slice(0, 80),
      body: String(fd.get('body') || '').trim().slice(0, 2000),
    };
    if (!payload.name || !payload.body) return;

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'Erro ao enviar');
        return;
      }
      form.reset();
      list?.insertAdjacentHTML('afterbegin', itemHTML(data));
    } catch {
      alert('Falha ao enviar comentário.');
    }
  });

  load();
})();