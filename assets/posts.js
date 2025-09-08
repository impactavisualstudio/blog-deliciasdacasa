// /assets/posts.js
// Catálogo central de posts do "Delícias da Casa"
window.POSTS = [
  // --- Já publicados (5 primeiros) ---
  {
    title: "Picanha perfeita: do sal grosso ao corte final",
    url: "/posts/churrasco-picanha-perfeito.html",
    excerpt: "Como escolher, salar, assar e fatiar a picanha perfeita.",
    image: "/assets/images/hero-picanha-1600.png"
  },
  {
    title: "Brisket texano: baixa temperatura, alto sabor",
    url: "/posts/brisket-texano-lento.html",
    excerpt: "Rub, defumação lenta, stall, embrulho e ponto ideal.",
    image: "/assets/images/brisket-1600.png"
  },
  {
    title: "Costela na brasa suculenta",
    url: "/posts/costela-na-brasa-suculenta.html",
    excerpt: "Tipos de costela, técnica 3-2-1, maciez sem erro.",
    image: "/assets/images/costela-1600.png"
  },
  {
    title: "Fraldinha marinada em 30 minutos",
    url: "/posts/fraldinha-marinada-rapida.html",
    excerpt: "Marinadas rápidas, preparo na brasa, forno e frigideira.",
    image: "/assets/images/fraldinha-1600.png"
  },
  {
    title: "Dry-aged: o que é e quando vale a pena",
    url: "/posts/dry-aged-o-que-e.html",
    excerpt: "Maturação a seco, diferenças, custos e como servir.",
    image: "/assets/images/dryaged-1600.png"
  },

  // --- Novos: continue preenchendo… (exemplos) ---
  {
    title: "Ancho: o rei do marmoreio",
    url: "/posts/ancho-marmoreio.html",
    excerpt: "Como escolher, pontos de cocção e técnicas de selagem.",
    image: "/assets/images/ancho-marmoreio-hero.jpg"
  },
  {
    title: "T-bone e Porterhouse: diferença e preparo",
    url: "/posts/tbone-porterhouse.html",
    excerpt: "Cortes irmãos, anatomia do osso e grelha perfeita.",
    image: "/assets/images/tbone-porterhouse-hero.jpg"
  },
  {
    title: "Maminha: maciez acessível",
    url: "/posts/maminha-churrasco.html",
    excerpt: "Seleção, fatiamento contra a fibra e acertos de ponto.",
    image: "/assets/images/maminha-churrasco-hero.jpg"
  },
  {
    title: "Alcatra completa: versatilidade na grelha",
    url: "/posts/alcatra-grelha.html",
    excerpt: "Cortes, preparo direto/indireto e acompanhamentos.",
    image: "/assets/images/alcatra-grelha-hero.jpg"
  },
  {
    title: "Contrafilé: clássico imbatível",
    url: "/posts/contrafile-brasa.html",
    excerpt: "Gordura na medida, selagem e descanso para suculência.",
    image: "/assets/images/contrafile-brasa-hero.jpg"
  },

  // TODO: adicione aqui os demais até completar seus 40 posts
];

// --- MAPA DE IMAGENS ---
// cada título bate com o "title" lá do window.POSTS
const IMAGE_MAP = {
  "Picanha perfeita: do sal grosso ao corte final": "/assets/images/picanha-1600.png",
  "Brisket texano: baixa temperatura, alto sabor": "/assets/images/brisket-1600.png",
  "Costela na brasa suculenta": "/assets/images/costela-1600.png",
  "Fraldinha marinada em 30 minutos": "/assets/images/fraldinha-1600.png",
  "Dry-aged: o que é e quando vale a pena": "/assets/images/dryaged-1600.png",

  // Novos .jpg (Sora)
  "Ancho: o rei do marmoreio": "/assets/images/ancho-marmoreio-hero.jpg",
  "T-bone e Porterhouse: diferença e preparo": "/assets/images/tbone-porterhouse-hero.jpg",
  "Maminha: maciez acessível": "/assets/images/maminha-churrasco-hero.jpg",
  "Alcatra completa: versatilidade na grelha": "/assets/images/alcatra-grelha-hero.jpg",
  "Contrafilé: clássico imbatível": "/assets/images/contrafile-brasa-hero.jpg",
  "Cupim: o segredo do fogo lento": "/assets/images/cupim-brasa-hero.jpg",
  "Chorizo argentino: simplicidade e sabor": "/assets/images/chorizo-argentino-hero.jpg"
};

  const DEFAULT_IMG = "/assets/images/hero-picanha-800.png";

// --- FUNÇÃO DE RENDERIZAÇÃO ---
window.renderPostCard = function (post) {
  const imgSrc = IMAGE_MAP[post.title] || post.image || DEFAULT_IMG;
  return `
    <article class="card">
      <a href="${post.url}">
        <img src="${imgSrc}"
             alt="${post.title}"
             loading="lazy"
             onerror="this.onerror=null; this.src='${DEFAULT_IMG}'"
             style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:10px">
        <h2>${post.title}</h2>
        <p>${post.excerpt || ""}</p>
      </a>
    </article>
  `;
};
