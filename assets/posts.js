// /assets/posts.js
// Catálogo central de posts do "Delícias da Casa"
window.POSTS = [
  // --- Já publicados (5 primeiros) ---
  {
    title: "Picanha perfeita: do sal grosso ao corte final",
    url: "/posts/churrasco-picanha-perfeito.html",
    excerpt: "Como escolher, salar, assar e fatiar a picanha perfeita.",
    image: "/assets/images/picanha-brasa-hero.png"
  },
  {
    title: "Brisket texano: baixa temperatura, alto sabor",
    url: "/posts/brisket-texano-lento.html",
    excerpt: "Rub, defumação lenta, stall, embrulho e ponto ideal.",
    image: "/assets/images/brisket-texano-hero.png"
  },
  {
    title: "Costela na brasa suculenta",
    url: "/posts/costela-na-brasa-suculenta.html",
    excerpt: "Tipos de costela, técnica 3-2-1, maciez sem erro.",
    image: "/assets/images/costela-fogo-chao-hero.png"
  },
  {
    title: "Fraldinha marinada em 30 minutos",
    url: "/posts/fraldinha-marinada-rapida.html",
    excerpt: "Marinadas rápidas, preparo na brasa, forno e frigideira.",
    image: "/assets/images/fraldinha-marinada-hero.png"
  },
  {
    title: "Dry-aged: o que é e quando vale a pena",
    url: "/posts/dry-aged-o-que-e.html",
    excerpt: "Maturação a seco, diferenças, custos e como servir.",
    image: "/assets/images/dryaged-carne-hero.png"
  },

  // --- Novos: continue preenchendo… (exemplos) ---
  {
    title: "Ancho: o rei do marmoreio",
    url: "/posts/ancho-marmoreio.html",
    excerpt: "Como escolher, pontos de cocção e técnicas de selagem.",
    image: "/assets/images/ancho-marmoreio-hero.png"
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

// Função utilitária para montar um card de post
window.renderPostCard = function (post) {
  return `
    <article class="card">
      <a href="${post.url}">
        ${post.image ? `<img src="${post.image}" alt="${post.title}" loading="lazy">` : ""}
        <h2>${post.title}</h2>
        <p>${post.excerpt || ""}</p>
      </a>
    </article>
  `;
};
