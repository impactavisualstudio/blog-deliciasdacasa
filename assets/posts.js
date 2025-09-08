// /assets/posts.js
// Catálogo central de posts do "Delícias da Casa"
// --- helpers de imagem ---
const img = (file) => `/assets/images/${file}`;
const IMG = {
  picanha:   img('hero-picanha-1600.png'),
  brisket:   img('brisket-1600.png'),
  costela:   img('costela-1600.png'),
  fraldinha: img('fraldinha-1600.png'),
  dryaged:   img('dryaged-1600.png'),

  // Novas (Sora) — exatamente como você subiu
  ancho:     img('ancho-marmoreio-hero.jpg'),
  tbone:     img('tbone-porterhouse-hero.jpg'),
  maminha:   img('maminha-churrasco-hero.jpg'),
  alcatra:   img('alcatra-grelha-hero.jpg')
};

const DEFAULT_IMG = IMG.picanha; // fallback

window.POSTS = [
  {
    title: "Picanha perfeita: do sal grosso ao corte final",
    excerpt: "Como escolher, salgar, assar e fatiar a picanha perfeita.",
    url: "/posts/churrasco-picanha-perfeito.html",
    image: IMG.picanha
  },
  {
    title: "Brisket texano: baixa temperatura, alto sabor",
    excerpt: "Rub, defumação lenta, stall, embrulho e ponto ideal.",
    url: "/posts/brisket-texano-lento.html",
    image: IMG.brisket
  },
  {
    title: "Costela na brasa suculenta",
    excerpt: "Tipos de costela, técnica 3-2-1, maciez sem erro.",
    url: "/posts/costela-na-brasa-suculenta.html",
    image: IMG.costela
  },
  {
    title: "Fraldinha marinada em 30 minutos",
    excerpt: "Marinadas rápidas, preparo na brasa, forno e frigideira.",
    url: "/posts/fraldinha-marinada-rapida.html",
    image: IMG.fraldinha
  },
  {
    title: "Dry-aged: o que é e quando vale a pena",
    excerpt: "Maturação a seco, diferenças, custos e como servir.",
    url: "/posts/dry-aged-o-que-e.html",
    image: IMG.dryaged
  },
  {
    title: "Ancho: o rei do marmoreio",
    excerpt: "Como escolher, pontos de cocção e técnicas de selagem.",
    url: "/posts/ancho-marmoreio.html",
    image: IMG.ancho
  },
  {
    title: "T-bone e Porterhouse: diferença e preparo",
    excerpt: "Cortes irmãos, anatomia do osso e grelha perfeita.",
    url: "/posts/tbone-porterhouse.html",
    image: IMG.tbone
  },
  {
    title: "Maminha: maciez acessível",
    excerpt: "Seleção, fatiamento contra a fibra e acertos de ponto.",
    url: "/posts/maminha-churrasco.html",
    image: IMG.maminha
  },
  {
    title: "Alcatra completa: versatilidade na grelha",
    excerpt: "Cortes, preparo direto/indireto e acompanhamentos.",
    url: "/posts/alcatra-grelha.html",
    image: IMG.alcatra
  }
  // …continue mapeando os próximos aqui, cada um com sua image
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

window.renderPostCard = function (post) {
  const imgSrc = post.image || DEFAULT_IMG;
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

