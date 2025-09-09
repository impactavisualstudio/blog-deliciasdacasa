// /assets/posts.js
// Catálogo central de posts do "Delícias da Casa"

// helpers
const img = (file) => `/assets/images/${file}`;
const IMG = {
  picanha:   img('hero-picanha-1600.png'),
  brisket:   img('brisket-1600.png'),
  costela:   img('costela-1600.png'),
  fraldinha: img('fraldinha-1600.png'),
  dryaged:   img('dryaged-1600.png'),

  // Sora
  ancho:     img('ancho-marmoreio-hero.jpg'),
  tbone:     img('tbone-porterhouse-hero.jpg'),
  maminha:   img('maminha-churrasco-hero.jpg'),
  alcatra:   img('alcatra-grelha-hero.jpg'),

  contrafile: img('contrafile-brasa-hero.jpg'),
  cupim:     img('cupim-brasa-hero.jpg'),
  chorizo:   img('chorizo-argentino-hero.jpg')
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
  },
  {
    title: "Contrafilé: clássico imbatível",
    excerpt: "Gordura na medida, selagem e descanso para suculência.",
    url: "/posts/contrafile-brasa.html",
    image: IMG.contrafile
  },
  {
    title: "Cupim: o segredo do fogo lento",
    excerpt: "Corte típico do boi zebuíno, preparo lento e sabor inconfundível.",
    url: "/posts/cupim-brasa.html",
    image: IMG.cupim
  },
  {
    title: "Chorizo argentino: simplicidade e sabor",
    excerpt: "O clássico das parrillas argentinas com chimichurri.",
    url: "/posts/chorizo-argentino.html",
    image: IMG.chorizo
  }

];

// render
window.renderPostCard = function (post) {
  const imgSrc = post.image || DEFAULT_IMG;
  console.log('[CARD]', post.title, '→', imgSrc);
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

