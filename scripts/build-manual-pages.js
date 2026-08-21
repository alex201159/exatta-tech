/**
 * Gera páginas estáticas individuais para cada manual/equipamento cadastrado
 * na Central do Balanceiro, para indexação no Google (URL própria por
 * fabricante/modelo). Lê os mesmos dados que o site usa em tempo real
 * (js/data.js + data/overrides.json), aplicando a mesma lógica de merge
 * usada por exattaLoadOverrides() no navegador, para garantir que a lista
 * gerada aqui é idêntica à que aparece na Central do Balanceiro ao vivo.
 *
 * Uso: node scripts/build-manual-pages.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "balancas");

/* ---------------------------------------------------------------------- */
/* 1. Carrega APPS/MANUALS/MANUFACTURERS etc. exatamente como o navegador */
/* ---------------------------------------------------------------------- */
const dataJsSrc = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
const sandbox = { window: {}, console, fetch: async () => ({ ok: false }) };
vm.createContext(sandbox);
vm.runInContext(dataJsSrc, sandbox);

const MANUALS = sandbox.window.MANUALS;
const MANUFACTURERS = sandbox.window.MANUFACTURERS;
const MANUAL_VIDEOS = sandbox.window.MANUAL_VIDEOS;

const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, "data/overrides.json"), "utf8"));
const removed = overrides.removed || {};

function mergeSection(baseArr, overrideItems, removedIds) {
  if (Array.isArray(removedIds) && removedIds.length) {
    for (let i = baseArr.length - 1; i >= 0; i--) {
      if (removedIds.includes(baseArr[i].id)) baseArr.splice(i, 1);
    }
  }
  if (Array.isArray(overrideItems)) {
    overrideItems.forEach((item) => {
      const idx = baseArr.findIndex((b) => b.id === item.id);
      if (idx !== -1) baseArr[idx] = item;
      else baseArr.push(item);
    });
  }
}

mergeSection(MANUALS, overrides.manuals, removed.manuals);
mergeSection(MANUFACTURERS, overrides.manufacturers, removed.manufacturers);
mergeSection(MANUAL_VIDEOS, overrides.videos, removed.videos);

/* ---------------------------------------------------------------------- */
/* 2. Slugs e agrupamento por marca                                       */
/* ---------------------------------------------------------------------- */
function slugify(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

const seenSlugs = new Set();
function uniqueSlug(brandSlug, base) {
  let slug = base;
  let n = 2;
  while (seenSlugs.has(`${brandSlug}/${slug}`)) {
    slug = `${base}-${n}`;
    n++;
  }
  seenSlugs.add(`${brandSlug}/${slug}`);
  return slug;
}

const items = MANUALS.map((m) => {
  const brandSlug = slugify(m.brand);
  const modelSlug = uniqueSlug(brandSlug, slugify(m.model));
  return { ...m, brandSlug, modelSlug };
});

const byBrand = new Map();
items.forEach((it) => {
  if (!byBrand.has(it.brandSlug)) byBrand.set(it.brandSlug, { name: it.brand, items: [] });
  byBrand.get(it.brandSlug).items.push(it);
});

/* ---------------------------------------------------------------------- */
/* 3. Template HTML (mesmo header/footer/CSS do restante do site)         */
/* ---------------------------------------------------------------------- */
function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function relatedVideos(manual) {
  return MANUAL_VIDEOS.filter(
    (v) => slugify(v.brand) === manual.brandSlug && (slugify(v.model) === manual.modelSlug || (v.model || "").toLowerCase().includes((manual.model || "").toLowerCase()))
  ).slice(0, 4);
}

function videoEmbed(url) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `<div class="modal-video"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="Vídeo técnico" allowfullscreen loading="lazy"></iframe></div>`;
  return `<a class="modal-video-link" href="${esc(url)}" target="_blank" rel="noopener">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10l5-3v10l-5-3"/></svg>'}<span>Assistir vídeo</span></a>`;
}

function pageTemplate(manual) {
  const title = `${manual.brand} ${manual.model} — Manual, calibração e suporte | Exatta Tech`;
  const metaDesc = `${manual.desc || `Manual e informações técnicas da ${manual.brand} ${manual.model}.`} Central do Balanceiro Exatta Tech.`.slice(0, 300);
  const canonical = `https://exattatech.com/balancas/${manual.brandSlug}/${manual.modelSlug}.html`;
  const videos = relatedVideos(manual);
  const depth = "../../";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="https://exattatech.com/assets/og-image.png">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="${depth}assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap">
<link rel="stylesheet" href="${depth}css/style.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "${esc(manual.brand)} ${esc(manual.model)}",
  "brand": { "@type": "Brand", "name": "${esc(manual.brand)}" },
  "category": "${esc(manual.type || "Equipamento de pesagem")}",
  "description": "${esc(manual.desc || "")}"
}
</script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-971996179"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-971996179');
</script>
</head>
<body>
<a class="skip-link" href="#main">Pular para o conteúdo</a>

<header class="site-header" id="siteHeader">
  <div class="container header-inner">
    <a href="${depth}index.html" class="brand">
      <span class="brand-mark"><i data-icon="scale"></i></span>
      <span class="brand-name">Exatta<span>Tech</span></span>
    </a>
    <nav class="nav-desktop" aria-label="Navegação principal">
      <a href="${depth}index.html">Início</a>
      <a href="${depth}index.html#solucoes">Soluções</a>
      <a href="${depth}apps.html">Aplicativos</a>
      <div class="nav-dropdown">
        <a href="${depth}vendas.html" class="nav-dropdown-trigger">Produtos<i data-icon="chevronDown"></i></a>
        <div class="nav-dropdown-panel">
          <a href="${depth}lc-teste.html">LC TESTE</a>
          <a href="${depth}calibrapro.html">CalibraPro</a>
          <a href="${depth}lc-agro.html">LC Agro</a>
          <a href="${depth}lc-carga.html">LC Carga</a>
          <div class="nav-dropdown-divider"></div>
          <a href="${depth}vendas.html">Ver todos os produtos</a>
        </div>
      </div>
      <a href="${depth}balanceiros.html" class="is-active">Central do Balanceiro</a>
      <a href="${depth}downloads.html">Downloads</a>
      <a href="${depth}ajuda.html">Ajuda</a>
      <a href="${depth}contato.html">Contato</a>
    </nav>
    <div class="header-actions">
      <a href="${depth}contato.html?assunto=Or%C3%A7amento%20personalizado" class="btn btn--primary btn--sm">Solicitar orçamento</a>
      <button class="nav-toggle" id="navToggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="navMobile">
        <i data-icon="menu" class="icon-menu"></i>
        <i data-icon="close" class="icon-close"></i>
      </button>
    </div>
  </div>
</header>

<nav class="nav-mobile" id="navMobile" aria-label="Navegação mobile">
  <a href="${depth}index.html">Início</a>
  <a href="${depth}index.html#solucoes">Soluções</a>
  <a href="${depth}apps.html">Aplicativos</a>
  <a href="${depth}vendas.html">Produtos</a>
  <div class="nav-mobile-sub">
    <a href="${depth}lc-teste.html">LC TESTE</a>
    <a href="${depth}calibrapro.html">CalibraPro</a>
    <a href="${depth}lc-agro.html">LC Agro</a>
    <a href="${depth}lc-carga.html">LC Carga</a>
  </div>
  <a href="${depth}balanceiros.html" class="is-active">Central do Balanceiro</a>
  <a href="${depth}downloads.html">Downloads</a>
  <a href="${depth}ajuda.html">Ajuda e suporte</a>
  <a href="${depth}contato.html">Contato</a>
  <a href="${depth}contato.html?assunto=Or%C3%A7amento%20personalizado" class="btn btn--primary btn--block">Solicitar orçamento</a>
</nav>

<main id="main">
  <section class="page-hero page-hero--compact">
    <div class="container">
      <div class="section-head" data-reveal>
        <nav aria-label="breadcrumb" style="margin-bottom:14px;font-size:13px;color:var(--text-muted)">
          <a href="${depth}balanceiros.html" style="color:var(--text-muted)">Central do Balanceiro</a>
          <span> / </span>
          <a href="${depth}balanceiros.html?q=${encodeURIComponent(manual.brand)}" style="color:var(--text-muted)">${esc(manual.brand)}</a>
          <span> / </span>
          <span>${esc(manual.model)}</span>
        </nav>
        <span class="eyebrow">${esc(manual.brand)} · ${esc(manual.type || "Equipamento de pesagem")}</span>
        <h1 class="section-title">${esc(manual.brand)} ${esc(manual.model)}</h1>
        <p class="section-sub">${esc(manual.desc || `Informações técnicas, manual e suporte para o equipamento ${manual.brand} ${manual.model}.`)}</p>
      </div>
    </div>
  </section>

  <section class="section section--tight section--flush-top">
    <div class="container">
      <div class="trust-bar trust-bar--tight" data-reveal>
        <div class="trust-item"><i data-icon="building"></i><span>Fabricante: ${esc(manual.brand)}</span></div>
        <div class="trust-item"><i data-icon="scale"></i><span>Tipo: ${esc(manual.type || "Equipamento de pesagem")}</span></div>
        <div class="trust-item"><i data-icon="file"></i><span>${manual.url ? "Manual em PDF disponível" : "Manual sob consulta"}</span></div>
        <div class="trust-item"><i data-icon="headset"></i><span>Suporte técnico Exatta Tech</span></div>
      </div>

      ${
        manual.url
          ? `<div class="about-preview" data-reveal style="margin-bottom:8px">
        <div>
          <span class="eyebrow">Manual técnico</span>
          <h2 class="section-title" style="font-size:26px">Baixe o manual do ${esc(manual.brand)} ${esc(manual.model)}</h2>
          <p class="section-sub">Manual de operação${manual.type ? ` do ${esc(manual.type.toLowerCase())}` : ""} ${esc(manual.brand)} ${esc(manual.model)}, com procedimentos de instalação, calibração e configuração.</p>
          <a class="btn btn--primary" href="${esc(manual.url)}" target="_blank" rel="noopener">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M12 3v13m0 0l-4-4m4 4l4-4"/><path d="M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>'} Baixar manual em PDF</a>
        </div>
        <div class="about-proof-grid">
          <div class="about-proof"><i data-icon="check"></i><strong>Manual oficial</strong><span>Documentação técnica do fabricante.</span></div>
          <div class="about-proof"><i data-icon="download"></i><strong>Download direto</strong><span>Sem cadastro, direto em PDF.</span></div>
        </div>
      </div>`
          : `<div class="about-preview" data-reveal style="margin-bottom:8px">
        <div>
          <span class="eyebrow">Manual sob consulta</span>
          <h2 class="section-title" style="font-size:26px">Ainda não temos este manual publicado</h2>
          <p class="section-sub">Estamos ampliando o acervo técnico da Central do Balanceiro. Se você precisa do manual do ${esc(manual.brand)} ${esc(manual.model)} agora, fale com a Exatta Tech — ajudamos a localizar ou te orientamos por telefone/WhatsApp.</p>
          <a data-wa-link data-wa-message="Olá! Estou procurando o manual do ${esc(manual.brand)} ${esc(manual.model)} e não encontrei na Central do Balanceiro." class="btn btn--primary"><i data-icon="whatsapp"></i>Pedir ajuda no WhatsApp</a>
        </div>
        <div class="about-proof-grid">
          <div class="about-proof"><i data-icon="search"></i><strong>Acervo em crescimento</strong><span>Novos manuais são adicionados com frequência.</span></div>
          <div class="about-proof"><i data-icon="headset"></i><strong>Suporte direto</strong><span>Fale com um técnico enquanto isso.</span></div>
        </div>
      </div>`
      }

      ${
        videos.length
          ? `<div class="section-head" data-reveal style="margin-top:36px">
        <span class="eyebrow">Vídeos técnicos</span>
        <h2 class="section-title" style="font-size:24px">Vídeos sobre ${esc(manual.brand)} ${esc(manual.model)}</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px" data-reveal>
        ${videos.map((v) => `<div>${videoEmbed(v.url)}<p style="font-size:13px;color:var(--text-secondary);margin-top:8px">${esc(v.desc || "")}</p></div>`).join("")}
      </div>`
          : ""
      }

      <div class="pd-promo-band" style="margin-top:40px" data-reveal>
        <img src="${depth}assets/uploads/products-prod-lc-teste-7ayd4.png" alt="LC TESTE">
        <div class="pd-promo-band-body">
          <strong>Trabalha com manutenção de balanças?</strong>
          <span>Conheça o LC TESTE, testador portátil de células de carga desenvolvido pela Exatta Tech, e o CalibraPro, sistema para emissão de certificados de calibração.</span>
        </div>
        <a href="${depth}lc-teste.html" class="btn btn--outline btn--sm">Conhecer o LC TESTE <i data-icon="arrowRight"></i></a>
      </div>

      <div class="home-final-cta" data-reveal style="margin-top:28px">
        <div>
          <span class="eyebrow">Central do Balanceiro</span>
          <h2 class="section-title">Procurando outro equipamento?</h2>
          <p class="section-sub">Volte para a Central do Balanceiro e pesquise por fabricante, modelo ou indicador.</p>
        </div>
        <div class="home-final-actions">
          <a href="${depth}balanceiros.html?q=${encodeURIComponent(manual.brand)}" class="btn btn--primary">Ver todos os manuais ${esc(manual.brand)}</a>
          <a href="${depth}balanceiros.html" class="btn btn--outline">Acessar a Central</a>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="${depth}index.html" class="brand">
          <span class="brand-mark"><i data-icon="scale"></i></span>
          <span class="brand-name">Exatta<span>Tech</span></span>
        </a>
        <p>Desenvolvimento de apps, softwares, sites, sistemas e soluções técnicas de pesagem.</p>
        <div class="footer-contact">
          <span>CNPJ: 57.593.441/0001-61</span>
          <span>Atendimento remoto em todo o Brasil</span>
          <a href="mailto:alexjunior201159@gmail.com">alexjunior201159@gmail.com</a>
          <a href="tel:+5537998466711">+55 (37) 99846-6711</a>
        </div>
      </div>
      <div class="footer-col">
        <h3>Soluções</h3>
        <ul>
          <li><a href="${depth}lc-teste.html">LC TESTE</a></li>
          <li><a href="${depth}calibrapro.html">CalibraPro</a></li>
          <li><a href="${depth}apps.html">Aplicativos</a></li>
          <li><a href="${depth}downloads.html">Downloads</a></li>
          <li><a href="${depth}vendas.html">Produtos</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Suporte</h3>
        <ul>
          <li><a href="${depth}guias/index.html">Guias técnicos</a></li>
          <li><a href="${depth}ajuda.html">Ajuda</a></li>
          <li><a href="${depth}balanceiros.html">Central do Balanceiro</a></li>
          <li><a href="${depth}contato.html">Contato</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Empresa</h3>
        <ul>
          <li><a href="${depth}sobre.html">Sobre nós</a></li>
          <li><a href="${depth}politica-privacidade.html">Política de Privacidade</a></li>
          <li><a href="${depth}termos-uso.html">Termos de Uso</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span id="year"></span> Exatta Tech. Todos os direitos reservados.</span>
      <span>Feito com precisão, em código.</span>
    </div>
  </div>
</footer>

<div class="float-stack">
  <button class="back-to-top" id="backToTop" aria-label="Voltar ao topo"><i data-icon="up"></i></button>
  <a class="whatsapp-float" data-wa-link aria-label="Falar com a Exatta Tech pelo WhatsApp">
    <i data-icon="whatsapp"></i>
    <span class="wa-tooltip">Falar com a Exatta Tech</span>
  </a>
</div>

<script src="${depth}js/data.js"></script>
<script src="${depth}js/main.js"></script>
<script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>
`;
}

/* ---------------------------------------------------------------------- */
/* 4. Página de listagem por marca (ex: /balancas/toledo/)                */
/* ---------------------------------------------------------------------- */
function brandIndexTemplate(brandSlug, brand) {
  const title = `Manuais e equipamentos ${brand.name} | Central do Balanceiro | Exatta Tech`;
  const metaDesc = `Manuais técnicos, calibração e suporte para equipamentos ${brand.name}: ${brand.items.slice(0, 6).map((i) => i.model).join(", ")}${brand.items.length > 6 ? " e mais" : ""}.`;
  const canonical = `https://exattatech.com/balancas/${brandSlug}/`;
  const depth = "../../";
  const rows = brand.items
    .map(
      (m) => `
        <a class="help-cat" href="${depth}balancas/${m.brandSlug}/${m.modelSlug}.html" data-reveal>
          <div class="ico"><i data-icon="${m.url ? "file" : "search"}"></i></div>
          <div>
            <strong>${esc(m.model)}</strong>
            <span>${esc(m.type || "Equipamento de pesagem")}${m.url ? " · Manual disponível" : ""}</span>
          </div>
        </a>`
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc.slice(0, 300))}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="${depth}assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap">
<link rel="stylesheet" href="${depth}css/style.css">
</head>
<body>
<a class="skip-link" href="#main">Pular para o conteúdo</a>
<header class="site-header" id="siteHeader">
  <div class="container header-inner">
    <a href="${depth}index.html" class="brand">
      <span class="brand-mark"><i data-icon="scale"></i></span>
      <span class="brand-name">Exatta<span>Tech</span></span>
    </a>
    <nav class="nav-desktop" aria-label="Navegação principal">
      <a href="${depth}index.html">Início</a>
      <a href="${depth}index.html#solucoes">Soluções</a>
      <a href="${depth}apps.html">Aplicativos</a>
      <div class="nav-dropdown">
        <a href="${depth}vendas.html" class="nav-dropdown-trigger">Produtos<i data-icon="chevronDown"></i></a>
        <div class="nav-dropdown-panel">
          <a href="${depth}lc-teste.html">LC TESTE</a>
          <a href="${depth}calibrapro.html">CalibraPro</a>
          <a href="${depth}lc-agro.html">LC Agro</a>
          <a href="${depth}lc-carga.html">LC Carga</a>
          <div class="nav-dropdown-divider"></div>
          <a href="${depth}vendas.html">Ver todos os produtos</a>
        </div>
      </div>
      <a href="${depth}balanceiros.html" class="is-active">Central do Balanceiro</a>
      <a href="${depth}downloads.html">Downloads</a>
      <a href="${depth}ajuda.html">Ajuda</a>
      <a href="${depth}contato.html">Contato</a>
    </nav>
    <div class="header-actions">
      <a href="${depth}contato.html?assunto=Or%C3%A7amento%20personalizado" class="btn btn--primary btn--sm">Solicitar orçamento</a>
      <button class="nav-toggle" id="navToggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="navMobile">
        <i data-icon="menu" class="icon-menu"></i>
        <i data-icon="close" class="icon-close"></i>
      </button>
    </div>
  </div>
</header>
<nav class="nav-mobile" id="navMobile" aria-label="Navegação mobile">
  <a href="${depth}index.html">Início</a>
  <a href="${depth}index.html#solucoes">Soluções</a>
  <a href="${depth}apps.html">Aplicativos</a>
  <a href="${depth}vendas.html">Produtos</a>
  <div class="nav-mobile-sub">
    <a href="${depth}lc-teste.html">LC TESTE</a>
    <a href="${depth}calibrapro.html">CalibraPro</a>
    <a href="${depth}lc-agro.html">LC Agro</a>
    <a href="${depth}lc-carga.html">LC Carga</a>
  </div>
  <a href="${depth}balanceiros.html" class="is-active">Central do Balanceiro</a>
  <a href="${depth}downloads.html">Downloads</a>
  <a href="${depth}ajuda.html">Ajuda e suporte</a>
  <a href="${depth}contato.html">Contato</a>
</nav>
<main id="main">
  <section class="page-hero page-hero--compact">
    <div class="container">
      <div class="section-head" data-reveal>
        <nav aria-label="breadcrumb" style="margin-bottom:14px;font-size:13px;color:var(--text-muted)">
          <a href="${depth}balanceiros.html" style="color:var(--text-muted)">Central do Balanceiro</a>
          <span> / </span>
          <span>${esc(brand.name)}</span>
        </nav>
        <span class="eyebrow">Central do Balanceiro</span>
        <h1 class="section-title">Manuais e equipamentos ${esc(brand.name)}</h1>
        <p class="section-sub">${brand.items.length} modelo${brand.items.length === 1 ? "" : "s"} ${esc(brand.name)} cadastrados. Selecione um equipamento para ver manual, vídeos e suporte técnico.</p>
      </div>
    </div>
  </section>
  <section class="section section--tight section--flush-top">
    <div class="container">
      <div class="help-cat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))" data-reveal>
        ${rows}
      </div>
    </div>
  </section>
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-bottom">
      <span>© <span id="year"></span> Exatta Tech. Todos os direitos reservados.</span>
      <a href="${depth}balanceiros.html">Voltar para a Central do Balanceiro</a>
    </div>
  </div>
</footer>
<script src="${depth}js/data.js"></script>
<script src="${depth}js/main.js"></script>
<script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>
`;
}

/* ---------------------------------------------------------------------- */
/* 5. Escreve os arquivos                                                 */
/* ---------------------------------------------------------------------- */
let written = 0;
for (const [brandSlug, brand] of byBrand) {
  const brandDir = path.join(OUT_DIR, brandSlug);
  fs.mkdirSync(brandDir, { recursive: true });
  fs.writeFileSync(path.join(brandDir, "index.html"), brandIndexTemplate(brandSlug, brand));
  written++;
  for (const manual of brand.items) {
    fs.writeFileSync(path.join(brandDir, `${manual.modelSlug}.html`), pageTemplate(manual));
    written++;
  }
}

/* ---------------------------------------------------------------------- */
/* 6. sitemap-balancas.xml                                                */
/* ---------------------------------------------------------------------- */
const urls = [];
for (const [brandSlug, brand] of byBrand) {
  urls.push(`  <url>\n    <loc>https://exattatech.com/balancas/${brandSlug}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
  brand.items.forEach((m) => {
    urls.push(`  <url>\n    <loc>https://exattatech.com/balancas/${brandSlug}/${m.modelSlug}.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
  });
}
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "sitemap-balancas.xml"), sitemapXml);

/* ---------------------------------------------------------------------- */
/* 7. js/manual-pages.js — mapa id -> URL da página estática, para o      */
/* balanceiros.html linkar "Ver página completa" sem duplicar a lógica    */
/* de slug no navegador (fonte única: este script).                      */
/* ---------------------------------------------------------------------- */
const urlMap = {};
items.forEach((m) => {
  urlMap[m.id] = `balancas/${m.brandSlug}/${m.modelSlug}.html`;
});
const manualPagesJs = `/**\n * Gerado automaticamente por scripts/build-manual-pages.js — não editar à mão.\n * Mapa id do manual -> URL da página estática própria (para SEO).\n * Rode "node scripts/build-manual-pages.js" de novo depois de mudar manuais\n * pelo painel admin, para manter este arquivo e as páginas em /balancas/\n * sincronizados com data/overrides.json.\n */\nwindow.MANUAL_PAGE_URLS = ${JSON.stringify(urlMap, null, 2)};\n`;
fs.writeFileSync(path.join(ROOT, "js/manual-pages.js"), manualPagesJs);

console.log(`Gerados ${written} arquivos (${byBrand.size} marcas, ${items.length} equipamentos) em /balancas/`);
console.log(`Com manual (PDF) disponível: ${items.filter((i) => i.url).length} / ${items.length}`);
console.log(`sitemap-balancas.xml gerado com ${urls.length} URLs.`);
console.log(`js/manual-pages.js gerado com ${Object.keys(urlMap).length} entradas.`);
