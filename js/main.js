/**
 * Exatta Tech — comportamento compartilhado do site.
 * Cada função de render verifica se o elemento-alvo existe na página
 * antes de rodar, então este mesmo arquivo pode ser incluído em todas
 * as páginas sem gerar erros.
 */
(function () {
  "use strict";

  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ------------------------------------------------------------------ */
  /* Ícones (feather-style, stroke currentColor)                        */
  /* ------------------------------------------------------------------ */
  const ICONS = {
    scale: '<path d="M12 3v18M5 8l-3 6a3.5 3.5 0 0 0 7 0l-3-6h6l-3 6a3.5 3.5 0 0 0 7 0l-3-6M5 8h3M16 8h3M8 21h8"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13V6a1 1 0 0 1 1-1h1a7 7 0 0 1 7 7v7a1 1 0 0 1-1 1z"/><path d="M11 13c4-2 7-5 9-10"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>',
    bluetooth: '<path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.6-.6-.6-2.6z"/>',
    headset: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    download: '<path d="M12 3v13m0 0l-4-4m4 4l4-4"/><path d="M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    shield: '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>',
    gauge: '<path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/><path d="M8 6l1.5 1.5M16 6l-1.5 1.5M4 14h2M18 14h2"/>',
    alert: '<path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    chevronDown: '<path d="M6 9l6 6 6-6"/>',
    whatsapp: '<path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.8-1.6A11 11 0 1 0 20.5 3.5z"/><path d="M8.4 8.3c.2-.6.5-.6.8-.6h.6c.2 0 .5 0 .7.5.3.6.9 2 1 2.1.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.2.8.3.5 1 1.4 2.1 2.2 1.4 1 1.7 1 2 1s.6-.5.9-.9c.2-.4.5-.3.8-.2.3.1 2 1 2.3 1.1.3.2.5.2.6.4.1.3.1.9-.2 1.5-.4.7-1.8 1.4-2.5 1.4-.7 0-1.6.1-4.6-1.5-3.7-2-5.9-6-6.1-6.3-.2-.3-1.4-1.9-1.4-3.6 0-1.7.9-2.5 1.2-2.9z"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    android: '<path d="M5 16v-4a7 7 0 0 1 14 0v4"/><path d="M4 16h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 3l1.5 2M16 3l-1.5 2"/><circle cx="9" cy="12" r="0.5"/><circle cx="15" cy="12" r="0.5"/>',
    windows: '<path d="M3 5.5L10.5 4.4V11H3zM11.5 4.3L21 3v8h-9.5zM3 12h7.5v6.6L3 17.6zM11.5 12H21v9l-9.5-1.3z"/>',
    pdf: '<path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v6h6"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.6-.6-.6-2.6z"/>',
    video: '<rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10l5-3v10l-5-3"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    question: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.2 2c-.6.6-1.3.9-1.3 2M12 17h.01"/>',
    file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/>',
    building: '<path d="M4 22V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v18M14 9h6a1 1 0 0 1 1 1v12"/><path d="M8 6h1M8 10h1M8 14h1M8 18h1"/>',
    pin: '<path d="M12 22s7-6.6 7-12A7 7 0 0 0 5 10c0 5.4 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    star: '<path d="M12 2l3.1 6.6 7.2.8-5.4 4.9 1.6 7.1L12 17.8 5.5 21.4l1.6-7.1L1.7 9.4l7.2-.8z"/>',
    filter: '<path d="M4 4h16l-6 8v6l-4 2v-8z"/>',
    package: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
    signal: '<path d="M2 20h.01M7 20v-4M12 20v-8M17 20v-12M22 20V4"/>',
  };

  function icon(name, cls) {
    const body = ICONS[name] || "";
    return `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }
  window.exattaIcon = icon;

  /* ------------------------------------------------------------------ */
  /* Páginas próprias de produto — id do app/produto -> URL da página    */
  /* dedicada (SEO). Usado para linkar "Ver página completa" nos cards. */
  /* ------------------------------------------------------------------ */
  const DETAIL_PAGES = {
    testador: "lc-teste.html",
    "prod-lc-teste-7ayd4": "lc-teste.html",
    "calibrapro-rbc": "calibrapro.html",
    "calibrapro-padrao": "calibrapro.html",
    "prod-calibrapro-rbc": "calibrapro.html",
    "prod-calibrapro-normal": "calibrapro.html",
    "lc-agro": "lc-agro.html",
    "lc-carga-atual": "lc-carga.html",
    "lc-carga-desktop": "lc-carga.html",
    "prod-lc-carga-desktop": "lc-carga.html",
  };

  /* ------------------------------------------------------------------ */
  /* Markdown leve — só ** negrito ** e # títulos, pra descrições longas */
  /* cadastradas pelo admin não aparecerem com a sintaxe crua no site.  */
  /* ------------------------------------------------------------------ */
  function mdLite(text) {
    if (!text) return "";
    return String(text)
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n{2,}/g, "<br><br>")
      .replace(/\n/g, "<br>");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    // Substitui elementos <i data-icon="nome"> pelo svg correspondente
    qsa("[data-icon]").forEach((el) => {
      const name = el.getAttribute("data-icon");
      el.innerHTML = icon(name);
      el.classList.add("icon");
    });

    initHeader();
    initMobileNav();
    initReveal();
    initCounters();
    initCardGlow();
    initWhatsapp();
    initBackToTop();
    initSmoothAnchors();
    renderHelpPage();
    initContactForm();
    initQuestionForm();

    // Junta os itens adicionados pelo painel admin (data/overrides.json) antes
    // de renderizar qualquer coisa que dependa de APPS/DOWNLOADS/MANUALS/etc.
    if (window.exattaLoadOverrides) await window.exattaLoadOverrides();

    renderHomeApps();
    renderHomeStats();
    renderAppStats();
    renderAppsPage();
    renderDownloadsPage();
    renderProductsPage();
    renderBalanceirosPage();
  });

  /* ------------------------------------------------------------------ */
  /* Header + menu mobile                                               */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    const header = qs("#siteHeader");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    const toggle = qs("#navToggle");
    const nav = qs("#navMobile");
    if (!toggle || !nav) return;
    const close = () => {
      toggle.classList.remove("is-open");
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    toggle.addEventListener("click", () => {
      const willOpen = !nav.classList.contains("is-open");
      toggle.classList.toggle("is-open", willOpen);
      nav.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
      document.body.style.overflow = willOpen ? "hidden" : "";
    });
    qsa("a", nav).forEach((a) => a.addEventListener("click", close));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal ao rolar a página                                           */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    const items = qsa("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => obs.observe(el));
  }

  function observeReveal(container) {
    if (!container) return;
    const items = qsa("[data-reveal]", container);
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    items.forEach((el) => obs.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Contadores animados                                                */
  /* ------------------------------------------------------------------ */
  function initCounters(container) {
    const els = qsa("[data-counter]", container);
    if (!els.length || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    els.forEach((el) => obs.observe(el));
  }

  function animateCount(el) {
    const target = parseFloat(el.getAttribute("data-counter"));
    const suffix = el.getAttribute("data-suffix") || "";
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ */
  /* Glow interativo nos cards                                          */
  /* ------------------------------------------------------------------ */
  function initCardGlow() {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  }

  /* ------------------------------------------------------------------ */
  /* WhatsApp flutuante                                                 */
  /* ------------------------------------------------------------------ */
  function waLink(customMsg) {
    const cfg = window.EXATTA_CONFIG || {};
    const msg = encodeURIComponent(customMsg || cfg.whatsappDefaultMsg || "Olá!");
    return `https://wa.me/${cfg.whatsappNumber}?text=${msg}`;
  }
  window.exattaWaLink = waLink;

  function initWhatsapp() {
    qsa("[data-wa-link]").forEach((el) => {
      const custom = el.getAttribute("data-wa-message");
      el.setAttribute("href", waLink(custom));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Voltar ao topo                                                     */
  /* ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = qs("#backToTop");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      () => btn.classList.toggle("is-visible", window.scrollY > 600),
      { passive: true }
    );
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initSmoothAnchors() {
    qsa('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      a.addEventListener("click", (e) => {
        const target = qs(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Home — preview de apps + stats dos balanceiros                     */
  /* ------------------------------------------------------------------ */
  function appMediaIcon(app) {
    if (app.image) {
      return `<div class="app-card-media"><img src="${app.image}" alt="${app.name}" loading="lazy"></div>`;
    }
    return `<div class="app-card-media">${icon(app.icon)}</div>`;
  }

  function renderHomeApps() {
    const el = qs("#homeAppsGrid");
    if (!el || typeof APPS === "undefined") return;
    el.innerHTML = APPS.slice(0, 3)
      .map((app, i) => {
        const accent = appAccent(app);
        return `
      <article class="app-tile app-tile--${accent.cls}" data-reveal data-reveal-delay="${i + 1}">
        <div class="app-tile-top">
          <div class="app-tile-icon">${app.image ? `<img src="${app.image}" alt="${app.name}" loading="lazy">` : icon(app.icon)}</div>
          <span class="tag app-tile-tag">${app.category}</span>
        </div>
        <h3>${app.name}</h3>
        <p class="desc">${app.shortDesc}</p>
        <div class="tech-pills">${app.tech.slice(0, 3).map((t) => `<span class="tech-pill">${t}</span>`).join("")}</div>
        <div class="app-tile-actions">
          <a class="btn btn--outline btn--sm" href="apps.html#${app.id}">Conhecer</a>
          ${app.hasDownload ? `<a class="btn btn--primary btn--sm" href="downloads.html#${app.id}">Download</a>` : ""}
        </div>
      </article>`;
      })
      .join("");
    observeReveal(el);
  }

  function renderHomeStats() {
    const el = qs("#balanceirosStats");
    if (!el || typeof BALANCEIROS_STATS === "undefined") return;
    el.innerHTML = BALANCEIROS_STATS.map(
      (s, i) => `
      <div class="stat-card" data-reveal data-reveal-delay="${i + 1}">
        <div class="num">${statNumberHtml(s)}</div>
        <div class="label">${s.customLabel ? s.label : s.label}</div>
      </div>`
    ).join("");
    observeReveal(el);
    initCounters(el);
  }

  function statNumberHtml(s) {
    if (s.customLabel) return `<span class="num-text">${s.customLabel}</span>`;
    if (!Number(s.value)) return `<span class="stat-soon">${s.emptyLabel || "Em breve"}</span>`;
    return `<span data-counter="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</span>`;
  }

  /* ------------------------------------------------------------------ */
  /* Apps.html                                                          */
  /* ------------------------------------------------------------------ */
  const APP_ACCENTS = {
    Balanças: { cls: "blue", chipIcon: "scale" },
    Gestão: { cls: "green", chipIcon: "leaf" },
    Técnico: { cls: "purple", chipIcon: "tool" },
    Produção: { cls: "cyan", chipIcon: "cpu" },
    Licenças: { cls: "pink", chipIcon: "shield" },
  };
  function appAccent(app) {
    return APP_ACCENTS[app.category] || { cls: "blue", chipIcon: "package" };
  }

  function renderAppSpotlight(app) {
    const el = qs("#appSpotlight");
    if (!el) return;
    if (!app) {
      el.innerHTML = "";
      return;
    }
    const accent = appAccent(app);
    const detailPage = DETAIL_PAGES[app.id];
    // Card inteiro é um link para a página própria (SEO) quando ela existe;
    // sem página própria, continua sendo um botão que abre o modal do app.
    const tag = detailPage ? "a" : "button";
    const openAttr = detailPage ? `href="${detailPage}"` : `type="button" data-open-app="${app.id}"`;
    el.innerHTML = `
      <${tag} class="app-spotlight app-spotlight--${accent.cls}" data-reveal ${openAttr}>
        <div class="app-spotlight-visual">
          <span class="app-spotlight-glow"></span>
          <div class="app-spotlight-icon">${app.image ? `<img src="${app.image}" alt="${app.name}" loading="lazy">` : icon(app.icon)}</div>
          <span class="app-spotlight-chip app-spotlight-chip--1">${icon(accent.chipIcon)}${app.category}</span>
          <span class="app-spotlight-chip app-spotlight-chip--2">${icon("check")}v${app.version}</span>
        </div>
        <div class="app-spotlight-body">
          <span class="app-spotlight-badge">${icon("star")}App em destaque</span>
          <h2>${app.name}</h2>
          <p>${app.shortDesc}</p>
          <div class="tech-pills">${app.tech.slice(0, 4).map((t) => `<span class="tech-pill">${t}</span>`).join("")}</div>
          <div class="app-spotlight-actions">
            <span class="btn btn--primary btn--sm">${detailPage ? "Ver página completa" : "Conhecer o app"}${icon("arrowRight")}</span>
            ${app.hasDownload && !detailPage ? `<a class="btn btn--outline btn--sm" href="downloads.html#${app.id}">${icon("download")}Download</a>` : ""}
          </div>
        </div>
      </${tag}>`;
    observeReveal(el);
  }

  function renderAppStats() {
    const targets = qsa(".app-stats-strip");
    if (!targets.length || typeof APPS === "undefined") return;
    const total = APPS.length;
    const categories = new Set(APPS.map((a) => a.category)).size;
    const techs = new Set(APPS.flatMap((a) => a.tech || [])).size;
    const downloadable = APPS.filter((a) => a.hasDownload).length;
    const html = [
      { n: total, l: "aplicativos desenvolvidos" },
      { n: categories, l: "categorias atendidas" },
      { n: techs, l: "tecnologias usadas" },
      { n: downloadable, l: "downloads imediatos" },
    ]
      .map((s) => `<div class="app-stat"><strong>${s.n}</strong><span>${s.l}</span></div>`)
      .join("");
    targets.forEach((el) => (el.innerHTML = html));
  }

  function renderAppsPage() {
    const grid = qs("#appsGrid");
    if (!grid || typeof APPS === "undefined") return;

    const featuredId = window.EXATTA_FEATURED_APP_ID;
    const spotlightApp =
      (featuredId && APPS.find((app) => app.id === featuredId)) ||
      APPS.find((app) => app.name.trim().toLowerCase() === "lc teste") ||
      APPS[0];
    renderAppSpotlight(spotlightApp);

    const searchInput = qs("#appsSearch");
    const chips = qsa("[data-filter]");
    let activeFilter = "all";
    let query = "";

    function paint() {
      const q = query.trim().toLowerCase();
      const list = APPS.filter((app) => {
        if (spotlightApp && app.id === spotlightApp.id) return false;
        const matchFilter = activeFilter === "all" || app.filters.includes(activeFilter);
        const matchQuery = !q || app.name.toLowerCase().includes(q) || app.shortDesc.toLowerCase().includes(q);
        return matchFilter && matchQuery;
      });

      if (!list.length) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            ${icon("search")}
            <h4>Nenhum aplicativo encontrado</h4>
            <p>Tente outro termo de busca ou selecione outra categoria.</p>
          </div>`;
        return;
      }

      grid.innerHTML = list
        .map((app, i) => {
          const accent = appAccent(app);
          return `
        <article class="app-tile app-tile--${accent.cls}" data-reveal data-reveal-delay="${(i % 3) + 1}" id="${app.id}">
          <div class="app-tile-top">
            <div class="app-tile-icon">${app.image ? `<img src="${app.image}" alt="${app.name}" loading="lazy">` : icon(app.icon)}</div>
            <span class="tag app-tile-tag">${app.category}</span>
          </div>
          <h3>${app.name}</h3>
          <p class="desc">${app.shortDesc}</p>
          <div class="tech-pills">${app.tech.slice(0, 3).map((t) => `<span class="tech-pill">${t}</span>`).join("")}</div>
          <div class="app-tile-actions">
            ${
              DETAIL_PAGES[app.id]
                ? `<a class="btn btn--outline btn--sm" href="${DETAIL_PAGES[app.id]}">Ver página</a>`
                : `<button class="btn btn--outline btn--sm" data-open-app="${app.id}">Conhecer</button>`
            }
            ${app.hasDownload ? `<a class="btn btn--primary btn--sm" href="downloads.html#${app.id}">Download</a>` : ""}
          </div>
        </article>`;
        })
        .join("");
      observeReveal(grid);
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        activeFilter = chip.getAttribute("data-filter");
        paint();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        query = e.target.value;
        paint();
      });
    }

    paint();
    initAppModal();

    // Abre modal automaticamente se a URL tiver um #id de app
    const hashId = window.location.hash.replace("#", "");
    if (hashId && APPS.some((a) => a.id === hashId)) {
      setTimeout(() => openAppModal(hashId), 300);
    }
  }

  function initAppModal() {
    const overlay = qs("#appModal");
    if (!overlay) return;
    // Delegação no document: os cartões são recriados a cada busca/filtro,
    // então ligar o clique direto nos botões antigos os deixaria mortos
    // depois da primeira busca.
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-app]");
      if (btn) openAppModal(btn.getAttribute("data-open-app"));
    });
    qsa("[data-modal-close]", overlay).forEach((el) => el.addEventListener("click", closeAppModal));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAppModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAppModal();
    });
  }

  function appMediaImages(app) {
    return [app.image, ...(app.gallery || [])].filter(Boolean);
  }

  function setAppModalMedia(overlay, src, iconName) {
    qs("#modalMedia", overlay).innerHTML = src
      ? `<img src="${src}" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:inherit">`
      : icon(iconName);
    qsa(".gallery-thumbs img", overlay).forEach((t) => t.classList.toggle("is-active", t.getAttribute("data-src") === src));
  }

  function openAppModal(id) {
    const overlay = qs("#appModal");
    const app = APPS.find((a) => a.id === id);
    if (!overlay || !app) return;
    const images = appMediaImages(app);

    qs("#modalTitle", overlay).textContent = app.name;
    qs("#modalCategory", overlay).textContent = app.category;
    qs("#modalVersion", overlay).textContent = `Versão ${app.version}`;
    qs("#modalDesc", overlay).textContent = app.fullDesc;
    qs("#modalFeatures", overlay).innerHTML = app.features
      .map((f) => `<li>${icon("check")}<span>${f}</span></li>`)
      .join("");
    qs("#modalTech", overlay).innerHTML = app.tech.map((t) => `<span class="tech-pill">${t}</span>`).join("");
    qs("#modalCompat", overlay).textContent = app.compatibility;
    qs("#modalChangelog", overlay).innerHTML = app.changelog
      .map((c) => `<p><strong>v${c.v}</strong> — ${c.d}</p>`)
      .join("");

    setAppModalMedia(overlay, images[0] || "", app.icon);
    const thumbsEl = qs("#modalThumbs", overlay);
    thumbsEl.innerHTML =
      images.length > 1
        ? images.map((src) => `<img src="${src}" data-src="${src}" alt="" class="${src === images[0] ? "is-active" : ""}">`).join("")
        : "";
    qsa("img", thumbsEl).forEach((thumb) => {
      thumb.addEventListener("click", () => setAppModalMedia(overlay, thumb.getAttribute("data-src"), app.icon));
    });

    qs("#modalVideoWrap", overlay).innerHTML = videosEmbedHtml(app.videos || []);

    const dlBtn = qs("#modalDownload", overlay);
    if (dlBtn) {
      dlBtn.hidden = !app.hasDownload;
      dlBtn.href = app.hasDownload ? `downloads.html#${app.id}` : "#";
    }
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", `#${id}`);
  }

  function closeAppModal() {
    const overlay = qs("#appModal");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ------------------------------------------------------------------ */
  /* Downloads.html                                                     */
  /* ------------------------------------------------------------------ */
  function renderDownloadsPage() {
    const grid = qs("#downloadsGrid");
    if (!grid || typeof DOWNLOADS === "undefined") return;

    const chips = qsa("[data-dl-filter]");
    let activeFilter = "all";

    const iconFor = { android: "android", windows: "windows", pdf: "pdf", tool: "tool" };

    function paint() {
      const list = DOWNLOADS.filter((d) => activeFilter === "all" || d.type === activeFilter);
      if (!list.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">${icon("search")}<h4>Nenhum arquivo nesta categoria</h4><p>Solicite o arquivo diretamente ao suporte.</p></div>`;
        return;
      }
      grid.innerHTML = list
        .map(
          (d, i) => `
        <div class="dl-card" data-reveal data-reveal-delay="${(i % 3) + 1}" id="${d.id.replace("dl-", "").replace("-apk", "")}">
          <div class="dl-card-top">
            <div class="dl-icon dl-icon--${d.type}">${
            d.image ? `<img src="${d.image}" alt="${d.name}" loading="lazy">` : icon(iconFor[d.type])
          }</div>
            <div>
              <h4>${d.name}</h4>
              <div class="plat">${d.platform}</div>
            </div>
          </div>
          <p>${mdLite(d.desc)}</p>
          <button class="card-link" data-open-download="${d.id}">Ver descrição completa ${icon("arrowRight")}</button>
          <div class="dl-meta">
            <span><b>Versão</b> ${d.version}</span>
            <span><b>Atualizado</b> ${d.date}</span>
            <span><b>Tamanho</b> ${d.size}</span>
            <span><b>Desenvolvedor</b> Exatta Tech</span>
          </div>
          ${d.current ? `<span class="dl-badge">Versão atual</span>` : ""}
          ${
            d.url
              ? `<a class="btn btn--primary btn--sm btn--block" href="${d.url}" download target="_blank" rel="noopener">${icon("download")} Baixar</a>`
              : `<button class="btn btn--primary btn--sm btn--block" data-download="${d.id}">${icon("download")} Baixar</button>`
          }
          <div class="dl-trust">${icon("shield")}Download oficial Exatta Tech</div>
        </div>`
        )
        .join("");
      observeReveal(grid);
      qsa("[data-download]", grid).forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.innerHTML = `${icon("check")} Solicitação enviada`;
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = `${icon("download")} Baixar`;
            btn.disabled = false;
          }, 2600);
        });
      });
      qsa("[data-open-download]", grid).forEach((btn) => {
        btn.addEventListener("click", () => openDownloadModal(btn.getAttribute("data-open-download")));
      });
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        activeFilter = chip.getAttribute("data-dl-filter");
        paint();
      });
    });

    paint();
    initDownloadModal();
  }

  function initDownloadModal() {
    const overlay = qs("#downloadModal");
    if (!overlay || overlay.dataset.bound) return;
    overlay.dataset.bound = "1";
    qsa("[data-modal-close]", overlay).forEach((el) => el.addEventListener("click", closeDownloadModal));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeDownloadModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDownloadModal();
    });
  }

  function openDownloadModal(id) {
    const overlay = qs("#downloadModal");
    const d = DOWNLOADS.find((x) => x.id === id);
    if (!overlay || !d) return;
    const iconFor = { android: "android", windows: "windows", pdf: "pdf", tool: "tool" };
    qs("#downloadModalMedia", overlay).innerHTML = d.image
      ? `<img src="${d.image}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
      : icon(iconFor[d.type]);
    qs("#downloadModalTitle", overlay).textContent = d.name;
    qs("#downloadModalPlatform", overlay).textContent = d.platform || "";
    qs("#downloadModalDesc", overlay).innerHTML = mdLite(d.desc) || "";
    qs("#downloadModalVersion", overlay).textContent = `Versão ${d.version || "-"}`;
    qs("#downloadModalSize", overlay).textContent = d.size || "-";
    qs("#downloadModalDate", overlay).textContent = d.date || "-";
    const dlBtn = qs("#downloadModalDownload", overlay);
    if (dlBtn) dlBtn.href = d.url || "#";
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeDownloadModal() {
    const overlay = qs("#downloadModal");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ------------------------------------------------------------------ */
  /* Vendas.html                                                        */
  /* ------------------------------------------------------------------ */
  function productMediaImages(p) {
    const list = [p.image, ...(p.gallery || [])].filter(Boolean);
    return list.length ? list : [];
  }

  function videoEmbedHtml(url) {
    if (!url) return "";
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (yt) {
      return `<div class="modal-video"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="Vídeo do produto" allowfullscreen loading="lazy"></iframe></div>`;
    }
    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) {
      return `<div class="modal-video"><iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Vídeo do produto" allowfullscreen loading="lazy"></iframe></div>`;
    }
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
      return `<div class="modal-video"><video controls src="${url}"></video></div>`;
    }
    return `<a class="modal-video-link" href="${url}" target="_blank" rel="noopener">${icon("video")}<span>Assistir vídeo</span></a>`;
  }

  function videosEmbedHtml(videos) {
    return (videos || []).map(videoEmbedHtml).join("");
  }

  function productCardHtml(p, i) {
    const isPromo = p.id === "prod-lc-teste-7ayd4";
    const genericPrice = ["consultar preço", "mensalidade"].includes((p.priceLabel || "").trim().toLowerCase());
    return `
      <article class="product-card" data-reveal data-reveal-delay="${(i % 3) + 1}">
        <div class="product-media">
          ${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : icon(p.icon)}
          ${isPromo ? `<span class="product-tag product-tag--promo">${icon("star")}1 mês grátis de CalibraPro</span>` : ""}
          ${p.availability === "low" ? `<span class="product-tag product-tag--low">Estoque limitado</span>` : ""}
        </div>
        <div class="product-body">
          <span class="cat">${p.category}</span>
          <h3>${p.name}</h3>
          <p>${mdLite(p.desc)}</p>
          <div class="product-price-row">
            <div class="product-price">${p.priceLabel}${genericPrice ? `<small>Valor sob consulta</small>` : `<small>à vista ou combinado</small>`}</div>
          </div>
          <div class="product-actions">
            ${
              DETAIL_PAGES[p.id]
                ? `<a class="btn btn--outline btn--sm" href="${DETAIL_PAGES[p.id]}">Ver página</a>`
                : `<button class="btn btn--outline btn--sm" data-open-product="${p.id}">Ver detalhes</button>`
            }
            <a class="btn btn--primary btn--sm" data-wa-link data-wa-message="Olá! Tenho interesse em: ${p.name}. Poderiam me passar mais informações?">Solicitar orçamento</a>
          </div>
        </div>
      </article>`;
  }

  /* ------------------------------------------------------------------ */
  /* Promoção em destaque (Vendas) — data-driven via overrides.json.    */
  /* Some sozinha se não houver promoção ativa, ou se o produto ligado  */
  /* a ela tiver sido removido.                                        */
  /* ------------------------------------------------------------------ */
  function renderVendasPromo() {
    const el = qs("#vendasPromo");
    if (!el) return;
    const promo = window.EXATTA_PROMO;
    const mainProduct =
      promo && promo.enabled !== false && typeof PRODUCTS !== "undefined"
        ? PRODUCTS.find((p) => p.id === promo.productId)
        : null;
    if (!promo || promo.enabled === false || !mainProduct) {
      el.innerHTML = "";
      return;
    }
    const bonusProduct = promo.bonusProductId ? PRODUCTS.find((p) => p.id === promo.bonusProductId) : null;
    const promoDetailPage = DETAIL_PAGES[mainProduct.id];
    const promoTag = promoDetailPage ? "a" : "button";
    const promoOpenAttr = promoDetailPage ? `href="${promoDetailPage}"` : `type="button" data-open-product="${mainProduct.id}"`;
    el.innerHTML = `
      <${promoTag} class="promo-combo" ${promoOpenAttr}>
        <span class="promo-combo-shine"></span>
        <div class="promo-combo-photos">
          <div class="promo-combo-photo">${
            mainProduct.image ? `<img src="${mainProduct.image}" alt="${mainProduct.name}" loading="lazy">` : icon(mainProduct.icon)
          }</div>
          ${
            bonusProduct
              ? `<span class="promo-combo-plus">${icon("close")}</span>
          <div class="promo-combo-photo promo-combo-photo--bonus">
            ${bonusProduct.image ? `<img src="${bonusProduct.image}" alt="${bonusProduct.name}" loading="lazy">` : icon(bonusProduct.icon)}
            ${promo.bonusLabel ? `<span class="promo-combo-free">${promo.bonusLabel}</span>` : ""}
          </div>`
              : ""
          }
        </div>
        <div class="promo-combo-body">
          ${promo.badge ? `<span class="promo-combo-badge">${icon("star")}${promo.badge}</span>` : ""}
          <h2 class="promo-combo-title">${mdLite(promo.title || mainProduct.name)}</h2>
          ${promo.text ? `<p class="promo-combo-text">${mdLite(promo.text)}</p>` : ""}
          <span class="promo-combo-cta">${promo.cta || "Ver oferta"} ${icon("arrowRight")}</span>
          ${promo.fine ? `<span class="promo-combo-fine">${promo.fine}</span>` : ""}
        </div>
      </${promoTag}>`;
  }

  function renderProductsPage() {
    const grid = qs("#productsGrid");
    if (!grid || typeof PRODUCTS === "undefined") return;
    renderVendasPromo();

    const chipsEl = qs("#productsFilterChips");
    const searchInput = qs("#productsSearch");
    const categories = Array.from(new Set(PRODUCTS.map((p) => (p.category || "").trim()).filter(Boolean)));
    let activeFilter = "all";
    let query = "";

    if (chipsEl) {
      chipsEl.innerHTML = [`<button class="chip is-active" data-filter="all">Todos</button>`]
        .concat(categories.map((c) => `<button class="chip" data-filter="${c}">${c}</button>`))
        .join("");
    }

    function paint() {
      const q = query.trim().toLowerCase();
      const list = PRODUCTS.filter((p) => {
        const matchFilter = activeFilter === "all" || (p.category || "").trim() === activeFilter;
        const matchQuery = !q || p.name.toLowerCase().includes(q) || (p.desc || "").toLowerCase().includes(q);
        return matchFilter && matchQuery;
      });

      if (!list.length) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            ${icon("search")}
            <h4>Nenhum produto encontrado</h4>
            <p>Tente outro termo de busca ou selecione outra categoria.</p>
          </div>`;
        return;
      }

      grid.innerHTML = list.map(productCardHtml).join("");
      observeReveal(grid);
      initWhatsapp();
    }

    if (chipsEl) {
      qsa("[data-filter]", chipsEl).forEach((chip) => {
        chip.addEventListener("click", () => {
          qsa("[data-filter]", chipsEl).forEach((c) => c.classList.remove("is-active"));
          chip.classList.add("is-active");
          activeFilter = chip.getAttribute("data-filter");
          paint();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        query = e.target.value;
        paint();
      });
    }

    paint();
    initProductModal();

    const hashId = window.location.hash.replace("#", "");
    if (hashId && PRODUCTS.some((p) => p.id === hashId)) {
      setTimeout(() => openProductModal(hashId), 300);
    }
  }

  function initProductModal() {
    const overlay = qs("#productModal");
    if (!overlay) return;
    // Delegação no document: a grid de produtos é recriada a cada busca/filtro,
    // então ligar o clique direto nos botões antigos os deixaria mortos depois
    // da primeira busca (mesmo padrão usado no modal de apps).
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-product]");
      if (btn) openProductModal(btn.getAttribute("data-open-product"));
    });
    qsa("[data-modal-close]", overlay).forEach((el) => el.addEventListener("click", closeProductModal));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeProductModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeProductModal();
    });
  }

  function setProductModalMedia(overlay, src) {
    qs("#productModalMedia", overlay).innerHTML = src
      ? `<img src="${src}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
      : icon("package");
    qsa(".gallery-thumbs img", overlay).forEach((t) => t.classList.toggle("is-active", t.getAttribute("data-src") === src));
  }

  function openProductModal(id) {
    const overlay = qs("#productModal");
    const p = PRODUCTS.find((x) => x.id === id);
    if (!overlay || !p) return;
    const images = productMediaImages(p);

    qs("#productModalTitle", overlay).textContent = p.name;
    qs("#productModalCategory", overlay).textContent = p.category || "";
    qs("#productModalDesc", overlay).innerHTML = mdLite(p.desc) || "";
    qs("#productModalAvail", overlay).textContent = p.availability === "low" ? "Estoque limitado" : "Disponível";
    qs("#productModalPrice", overlay).textContent = p.priceLabel || "Consultar preço";

    setProductModalMedia(overlay, images[0] || "");
    const thumbsEl = qs("#productModalThumbs", overlay);
    thumbsEl.innerHTML =
      images.length > 1
        ? images.map((src) => `<img src="${src}" data-src="${src}" alt="" class="${src === images[0] ? "is-active" : ""}">`).join("")
        : "";
    qsa("img", thumbsEl).forEach((thumb) => {
      thumb.addEventListener("click", () => setProductModalMedia(overlay, thumb.getAttribute("data-src")));
    });

    const videos = p.videos || (p.videoUrl ? [p.videoUrl] : []);
    qs("#productModalVideoWrap", overlay).innerHTML = videosEmbedHtml(videos);

    const quoteBtn = qs("#productModalQuote", overlay);
    quoteBtn.setAttribute("data-wa-message", `Olá! Tenho interesse em: ${p.name}. Poderiam me passar mais informações?`);
    initWhatsapp();

    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", `#${id}`);
  }

  function closeProductModal() {
    const overlay = qs("#productModal");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ------------------------------------------------------------------ */
  /* Busca de vídeos no YouTube (Central dos Balanceiros)                */
  /* ------------------------------------------------------------------ */
  function escapeHtml(str) {
    return (str || "").toString().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const ytCache = new Map();
  let ytDebounceTimer = null;
  let ytRequestToken = 0;

  async function fetchYoutubeVideos(query) {
    const apiKey = (window.EXATTA_CONFIG || {}).youtubeApiKey;
    if (!apiKey) return { ok: false, reason: "no-key", items: [] };
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(
      query + " balança"
    )}&key=${apiKey}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        let reason = "error";
        try {
          const errBody = await res.json();
          if (res.status === 403 && /quota/i.test(JSON.stringify(errBody))) reason = "quota";
        } catch (e) {
          /* corpo de erro não era JSON — mantém reason genérico */
        }
        return { ok: false, reason, items: [] };
      }
      const data = await res.json();
      const items = (data.items || [])
        .filter((it) => it.id && it.id.videoId)
        .map((it) => ({
          id: it.id.videoId,
          title: it.snippet.title,
          channel: it.snippet.channelTitle,
          thumbnail: (it.snippet.thumbnails.medium || it.snippet.thumbnails.default).url,
          url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
        }));
      return { ok: true, items };
    } catch (e) {
      return { ok: false, reason: "network", items: [] };
    }
  }

  function youtubeSearchFallbackUrl(query) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " balança")}`;
  }

  function renderYoutubeSkeleton(grid) {
    grid.innerHTML = Array.from({ length: 3 })
      .map(
        () => `
      <div class="result-card yt-card">
        <div class="skeleton yt-skeleton"></div>
        <div class="yt-card-body">
          <div class="skeleton" style="height:14px;width:80%;margin-bottom:8px;border-radius:4px"></div>
          <div class="skeleton" style="height:12px;width:50%;border-radius:4px"></div>
        </div>
      </div>`
      )
      .join("");
  }

  function renderYoutubeResults(wrap, grid, query, result) {
    wrap.hidden = false;
    if (result.ok && result.items.length) {
      grid.innerHTML = result.items
        .map(
          (v) => `
        <a class="result-card yt-card" href="${v.url}" target="_blank" rel="noopener">
          <img class="yt-thumb" src="${v.thumbnail}" alt="${escapeHtml(v.title)}" loading="lazy">
          <div class="yt-card-body">
            <span class="tag">YouTube</span>
            <h4>${escapeHtml(v.title)}</h4>
            <div class="meta">${escapeHtml(v.channel)}</div>
          </div>
        </a>`
        )
        .join("");
      observeReveal(grid);
      return;
    }
    const msg =
      result.reason === "quota"
        ? "O limite diário de buscas no YouTube foi atingido."
        : result.reason === "no-key"
        ? "Busca de vídeos externos ainda não configurada."
        : result.ok
        ? "Nenhum vídeo encontrado no YouTube para essa busca."
        : "Não foi possível buscar vídeos no YouTube agora.";
    grid.innerHTML = `
      <div class="yt-fallback" style="grid-column:1/-1">
        <p>${msg}</p>
        <a class="btn btn--outline btn--sm" href="${youtubeSearchFallbackUrl(query)}" target="_blank" rel="noopener">${icon(
      "search"
    )} Buscar "${escapeHtml(query)}" no YouTube</a>
      </div>`;
  }

  function triggerYoutubeSearch(query) {
    const wrap = qs("#youtubeResultsWrap");
    const grid = qs("#youtubeResultsGrid");
    if (!wrap || !grid) return;
    clearTimeout(ytDebounceTimer);
    const q = query.trim();
    if (!q) {
      wrap.hidden = true;
      grid.innerHTML = "";
      return;
    }
    ytDebounceTimer = setTimeout(async () => {
      const myToken = ++ytRequestToken;
      if (ytCache.has(q)) {
        renderYoutubeResults(wrap, grid, q, ytCache.get(q));
        return;
      }
      wrap.hidden = false;
      renderYoutubeSkeleton(grid);
      const result = await fetchYoutubeVideos(q);
      ytCache.set(q, result);
      if (myToken !== ytRequestToken) return; // uma busca mais nova já está em andamento
      renderYoutubeResults(wrap, grid, q, result);
    }, 600);
  }

  /* ------------------------------------------------------------------ */
  /* Balanceiros.html                                                   */
  /* ------------------------------------------------------------------ */
  function renderBalanceirosPage() {
    const brandChips = qs("#brandChips");
    if (!brandChips || typeof MANUFACTURERS === "undefined") return;

    // Chips de fabricantes — contagem real de manuais cadastrados por marca,
    // não o número fixo de exemplo que ficava em MANUFACTURERS[].count.
    const manufacturersWithManuals = MANUFACTURERS.map((m) => ({
      ...m,
      realCount: MANUALS.filter((man) => man.brand === m.name).length,
    })).filter((m) => m.realCount > 0);

    brandChips.innerHTML =
      `<button class="chip is-active" data-brand="all">Todos <span class="count">(${MANUALS.length})</span></button>` +
      manufacturersWithManuals
        .map((m) => `<button class="chip" data-brand="${m.name}">${m.name} <span class="count">(${m.realCount})</span></button>`)
        .join("");

    // Stats
    const statsEl = qs("#balStats");
    if (statsEl) {
      statsEl.innerHTML = BALANCEIROS_STATS.map(
        (s, i) => `
        <div class="stat-card" data-reveal data-reveal-delay="${i + 1}">
          <div class="num">${statNumberHtml(s)}</div>
          <div class="label">${s.label}</div>
        </div>`
      ).join("");
      observeReveal(statsEl);
      initCounters(statsEl);
    }

    let activeBrand = "all";
    let query = "";
    let visibleManuals = 6;
    let visibleVideos = 6;

    const searchInput = qs("#balSearch");
    const manualsGrid = qs("#manualsGrid");
    const videosGrid = qs("#videosGrid");
    const questionsGrid = qs("#questionsGrid");

    function matches(item, brandKey, modelKey) {
      const q = query.trim().toLowerCase();
      const matchBrand = activeBrand === "all" || item[brandKey] === activeBrand;
      const extra = [item.type, item.desc, item.question].filter(Boolean).join(" ").toLowerCase();
      const matchQuery =
        !q ||
        item[brandKey].toLowerCase().includes(q) ||
        item[modelKey].toLowerCase().includes(q) ||
        extra.includes(q);
      return matchBrand && matchQuery;
    }

    function updateTabCount(name, count) {
      const el = qs(`[data-tab-count="${name}"]`);
      if (!el) return;
      if (!count && !query.trim()) {
        el.textContent = "";
        el.classList.remove("has-results");
        return;
      }
      el.textContent = String(count);
      el.classList.toggle("has-results", query.trim().length > 0 && count > 0);
    }

    function paintManuals() {
      if (!manualsGrid) return;
      const list = MANUALS.filter((m) => matches(m, "brand", "model"));
      updateTabCount("manuais", list.length);
      if (!list.length) {
        manualsGrid.innerHTML = emptyState("Nenhum manual encontrado", "Tente buscar por outro fabricante ou modelo.");
        qs("#manualsLoadMore") && (qs("#manualsLoadMore").style.display = "none");
        return;
      }
      const shown = list.slice(0, visibleManuals);
      manualsGrid.innerHTML = shown
        .map(
          (m) => `
        <div class="result-card" data-reveal>
          <div class="result-card-head">
            <div class="ico">${icon("pdf")}</div>
            <div>
              <h4>${m.brand} — ${m.model}</h4>
              <div class="meta">${m.type}</div>
            </div>
          </div>
          <p>${m.desc}</p>
          <div class="result-card-actions">
            ${
              window.MANUAL_PAGE_URLS && window.MANUAL_PAGE_URLS[m.id]
                ? `<a class="btn btn--primary btn--sm" href="${window.MANUAL_PAGE_URLS[m.id]}">Ver página</a>`
                : ""
            }
            ${
              m.url
                ? `<a class="btn btn--outline btn--sm" href="${m.url}" target="_blank" rel="noopener">Visualizar</a>`
                : `<button class="btn btn--outline btn--sm" disabled title="Link ainda não cadastrado">Visualizar</button>`
            }
            ${
              m.sourceUrl
                ? `<a class="btn btn--ghost btn--sm" href="${m.sourceUrl}" target="_blank" rel="noopener">Abrir fonte</a>`
                : ""
            }
          </div>
        </div>`
        )
        .join("");
      observeReveal(manualsGrid);
      const moreWrap = qs("#manualsLoadMore");
      if (moreWrap) moreWrap.style.display = list.length > shown.length ? "block" : "none";
    }

    function paintVideos() {
      if (!videosGrid) return;
      const list = MANUAL_VIDEOS.filter((m) => matches(m, "brand", "model"));
      updateTabCount("videos", list.length);
      if (!list.length) {
        videosGrid.innerHTML = emptyState("Nenhum vídeo encontrado", "Tente buscar por outro fabricante ou modelo.");
        return;
      }
      const shown = list.slice(0, visibleVideos);
      videosGrid.innerHTML = shown
        .map(
          (m) => `
        <div class="result-card" data-reveal>
          <div class="result-card-head">
            <div class="ico">${icon("video")}</div>
            <div>
              <h4>${m.brand} — ${m.model}</h4>
              <div class="meta">Vídeo técnico</div>
            </div>
          </div>
          <p>${m.desc}</p>
          <div class="result-card-actions">
            ${
              m.url
                ? `<a class="btn btn--outline btn--sm btn--block" href="${m.url}" target="_blank" rel="noopener">Assistir</a>`
                : `<button class="btn btn--outline btn--sm btn--block" disabled title="Link ainda não cadastrado">Assistir</button>`
            }
          </div>
        </div>`
        )
        .join("");
      observeReveal(videosGrid);
      const moreWrap = qs("#videosLoadMore");
      if (moreWrap) moreWrap.style.display = list.length > shown.length ? "block" : "none";
    }

    function paintQuestions() {
      if (!questionsGrid) return;
      const list = COMMUNITY_QUESTIONS.filter((m) => matches(m, "brand", "model"));
      updateTabCount("perguntas", list.length);
      if (!list.length) {
        questionsGrid.innerHTML = emptyState("Nenhuma pergunta encontrada", "Seja o primeiro a perguntar sobre esse equipamento.");
        return;
      }
      questionsGrid.innerHTML = list
        .map(
          (m) => `
        <div class="result-card qa-card" data-reveal style="grid-column: span 1;">
          <div class="result-card-head">
            <div class="ico">${icon("question")}</div>
            <div>
              <h4>${m.brand} — ${m.model}</h4>
              <div class="meta">Pergunta</div>
            </div>
          </div>
          <p>${m.question}</p>
          ${
            m.answer
              ? `<div class="qa-answer"><strong>Resposta</strong><p>${m.answer}</p></div>`
              : `<div class="qa-answer qa-answer--pending">Ainda sem resposta publicada.</div>`
          }
        </div>`
        )
        .join("");
      observeReveal(questionsGrid);
    }

    function paintAll() {
      paintManuals();
      paintVideos();
      paintQuestions();
    }

    qsa("[data-brand]", brandChips).forEach((chip) => {
      chip.addEventListener("click", () => {
        qsa("[data-brand]", brandChips).forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        activeBrand = chip.getAttribute("data-brand");
        visibleManuals = 6;
        visibleVideos = 6;
        paintAll();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        query = e.target.value;
        visibleManuals = 6;
        visibleVideos = 6;
        paintAll();
        triggerYoutubeSearch(query);
      });
      if (searchInput.value) triggerYoutubeSearch(searchInput.value);
    }

    const manualsMoreBtn = qs("#manualsLoadMore button");
    if (manualsMoreBtn) {
      manualsMoreBtn.addEventListener("click", () => {
        visibleManuals += 6;
        paintManuals();
      });
    }

    const videosMoreBtn = qs("#videosLoadMore button");
    if (videosMoreBtn) {
      videosMoreBtn.addEventListener("click", () => {
        visibleVideos += 6;
        paintVideos();
      });
    }

    initTabs();
    paintAll();
  }

  function emptyState(title, sub) {
    return `<div class="empty-state" style="grid-column:1/-1">${icon("search")}<h4>${title}</h4><p>${sub}</p></div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Tabs genéricas (usado em balanceiros.html)                         */
  /* ------------------------------------------------------------------ */
  function initTabs() {
    qsa(".tabs").forEach((tabBar) => {
      const buttons = qsa(".tab-btn", tabBar);
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-tab-target");
          buttons.forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          qsa(`[data-tab-panel]`).forEach((panel) => {
            panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
          });
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Ajuda.html                                                         */
  /* ------------------------------------------------------------------ */
  function renderHelpPage() {
    const catGrid = qs("#helpCatGrid");
    const accEl = qs("#faqAccordion");
    if (!catGrid && !accEl) return;

    if (catGrid && typeof HELP_CATEGORIES !== "undefined") {
      catGrid.innerHTML = HELP_CATEGORIES.map(
        (c, i) => `
        <button class="help-cat" data-cat="${c.id}" data-reveal data-reveal-delay="${(i % 6) + 1}">
          <div class="ico">${icon(c.icon)}</div>
          <div>
            <strong>${c.name}</strong>
            <span>${c.desc}</span>
          </div>
        </button>`
      ).join("");
      observeReveal(catGrid);
    }

    let activeCat = "all";
    let query = "";

    function paintFaq() {
      if (!accEl || typeof FAQ === "undefined") return;
      const q = query.trim().toLowerCase();
      const list = FAQ.filter((f) => {
        const matchCat = activeCat === "all" || f.cat === activeCat;
        const matchQuery = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
        return matchCat && matchQuery;
      });

      if (!list.length) {
        accEl.innerHTML = emptyState("Nenhuma pergunta encontrada", "Tente outro termo ou fale diretamente com o suporte.");
        return;
      }

      accEl.innerHTML = list
        .map(
          (f, i) => `
        <div class="acc-item" data-reveal data-reveal-delay="${(i % 4) + 1}">
          <button class="acc-trigger" aria-expanded="false">
            <span>${f.q}</span>
            ${icon("chevronDown", "chev")}
          </button>
          <div class="acc-panel">
            <div class="acc-panel-inner">${f.a}</div>
          </div>
        </div>`
        )
        .join("");
      observeReveal(accEl);
      bindAccordion();
    }

    function bindAccordion() {
      qsa(".acc-item", accEl).forEach((item) => {
        const trigger = qs(".acc-trigger", item);
        const panel = qs(".acc-panel", item);
        trigger.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");
          item.classList.toggle("is-open", !isOpen);
          trigger.setAttribute("aria-expanded", String(!isOpen));
          panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : "0px";
        });
      });
    }

    if (catGrid) {
      qsa("[data-cat]", catGrid).forEach((btn) => {
        btn.addEventListener("click", () => {
          const already = btn.classList.contains("is-active");
          qsa("[data-cat]", catGrid).forEach((c) => c.classList.remove("is-active"));
          activeCat = already ? "all" : btn.getAttribute("data-cat");
          if (!already) btn.classList.add("is-active");
          paintFaq();
        });
      });
    }

    const helpSearch = qs("#helpSearch");
    if (helpSearch) {
      helpSearch.addEventListener("input", (e) => {
        query = e.target.value;
        paintFaq();
      });
    }

    paintFaq();
  }

  /* ------------------------------------------------------------------ */
  /* Contato.html                                                       */
  /* ------------------------------------------------------------------ */
  function initContactForm() {
    const form = qs("#contactForm");
    if (!form) return;

    const typeButtons = qsa("[data-contact-type]");
    const subjectField = qs("#assunto");
    const serviceField = qs("#servico");
    const params = new URLSearchParams(window.location.search);
    const presetSubject = params.get("assunto");
    if (presetSubject && subjectField) subjectField.value = presetSubject;
    if (presetSubject && serviceField && !serviceField.value) serviceField.value = "Outro / Não sei ainda";

    typeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        typeButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const label = btn.querySelector("span").textContent;
        const serviceByLabel = {
          "Aplicativo móvel": "Aplicativo móvel",
          "Sistema web": "Sistema / Software web",
          "Solução para pesagem": "Solução para pesagem",
          "Outro projeto": "Outro / Não sei ainda",
        };
        if (subjectField) subjectField.value = label === "Orçamento" ? "Orçamento personalizado" : label;
        if (serviceField && serviceByLabel[label]) serviceField.value = serviceByLabel[label];
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      qsa("[required]", form).forEach((input) => {
        const field = input.closest(".field");
        const ok = input.value.trim().length > 0 && (input.type !== "email" || /\S+@\S+\.\S+/.test(input.value));
        field.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      const data = Object.fromEntries(new FormData(form).entries());
      const toast = qs("#formToast");
      const toastIcon = toast ? toast.querySelector("i, svg") : null;
      const toastText = toast ? toast.querySelector("span") : null;
      const submitBtn = form.querySelector('button[type="submit"]');
      const cfg = window.EXATTA_CONFIG || {};
      const fileInput = qs("#arquivo", form);
      const fileName = fileInput && fileInput.files && fileInput.files.length ? fileInput.files[0].name : "";
      const payload = new FormData(form);
      payload.set("Nome", data.nome || "");
      payload.set("Telefone", data.telefone || "");
      payload.set("E-mail para resposta", data.email || "");
      payload.set("Cidade / Estado", data.cidade || "-");
      payload.set("Tipo de serviço", data.servico || "");
      payload.set("Preferência de contato", data.preferencia || "WhatsApp");
      payload.set("Assunto", data.assunto || "Contato pelo site");
      payload.set("Mensagem", data.mensagem || "");
      payload.set("Arquivo informado", fileName || "-");
      payload.set("_subject", `Novo contato pelo site: ${data.assunto || "Contato"}`);
      payload.set("_template", "table");
      payload.set("_captcha", "false");

      const waBtn = qs("#sendWhatsapp");
      if (waBtn) {
        const msg = [
          `Olá! Meu nome é ${data.nome || ""}.`,
          `Quero solicitar um orçamento com a Exatta Tech.`,
          `Serviço: ${data.servico || "Não informado"}.`,
          data.cidade ? `Cidade/Estado: ${data.cidade}.` : "",
          `Preferência de contato: ${data.preferencia || "WhatsApp"}.`,
          `Descrição: ${data.mensagem || ""}`,
        ]
          .filter(Boolean)
          .join("\n");
        waBtn.href = waLink(msg);
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }

      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cfg.email || "")}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
      })
        .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
        .then(({ ok, body }) => {
          if (!ok || (body && body.success === "false")) throw new Error((body && body.message) || "Falha ao enviar");
          if (toast) {
            if (toastIcon) toastIcon.outerHTML = icon("check");
            if (toastText) toastText.textContent = "Solicitação enviada com sucesso! Nossa equipe analisará sua necessidade e responderá em breve com uma proposta personalizada.";
            toast.classList.remove("is-error");
            toast.classList.add("is-visible");
            toast.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          form.reset();
        })
        .catch(() => {
          if (toast) {
            if (toastIcon) toastIcon.outerHTML = icon("alert");
            if (toastText) toastText.textContent = "Não deu para enviar por e-mail agora. Fale pelo WhatsApp para garantir a resposta.";
            toast.classList.add("is-visible", "is-error");
            toast.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar solicitação de orçamento";
          }
        });
    });
  }

  function initQuestionForm() {
    const form = qs("#questionForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      qsa("[required]", form).forEach((input) => {
        const field = input.closest(".field");
        const ok = input.value.trim().length > 0;
        field.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      const data = Object.fromEntries(new FormData(form).entries());
      const toast = qs("#questionToast");
      const toastIcon = toast ? toast.querySelector("i, svg") : null;
      const toastText = toast ? toast.querySelector("span") : null;
      const submitBtn = form.querySelector('button[type="submit"]');
      const cfg = window.EXATTA_CONFIG || {};

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }

      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cfg.email || "")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Nome: data.nome || "",
          "Contato (WhatsApp/e-mail)": data.contato || "-",
          Fabricante: data.brand || "",
          Modelo: data.model || "",
          Pergunta: data.question || "",
          _subject: `Nova pergunta na Central dos Balanceiros: ${data.brand || ""} — ${data.model || ""}`,
          _template: "table",
          _captcha: "false",
        }),
      })
        .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
        .then(({ ok, body }) => {
          if (!ok || (body && body.success === "false")) throw new Error((body && body.message) || "Falha ao enviar");
          if (toast) {
            if (toastIcon) toastIcon.outerHTML = icon("check");
            if (toastText) toastText.textContent = "Pergunta enviada! Nossa equipe vai responder e publicar aqui nesta aba assim que possível.";
            toast.classList.remove("is-error");
            toast.classList.add("is-visible");
            toast.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          form.reset();
        })
        .catch(() => {
          if (toast) {
            if (toastIcon) toastIcon.outerHTML = icon("alert");
            if (toastText) toastText.textContent = "Não deu para enviar agora. Tente novamente ou fale pelo WhatsApp.";
            toast.classList.add("is-visible", "is-error");
            toast.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar pergunta";
          }
        });
    });
  }
})();
