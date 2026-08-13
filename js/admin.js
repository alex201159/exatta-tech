/**
 * Exatta Tech — painel admin.
 * Lê e grava data/overrides.json diretamente no repositório do GitHub via
 * API REST, usando um Personal Access Token informado pelo próprio usuário
 * (nunca fica salvo no repositório — só no localStorage/sessionStorage do
 * navegador que ele escolher usar).
 */
(function () {
  "use strict";

  const PIN = "8833";
  const AUTH_KEY = "exatta_admin_authed";
  const CFG_KEY = "exatta_admin_github_cfg";
  const GH_API = "https://api.github.com";
  const FILE_PATH = "data/overrides.json";

  const SECTIONS = ["apps", "downloads", "manuals", "videos", "products", "manufacturers"];

  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const STATE = {
    cfg: null, // { owner, repo, branch, token }
    overrides: emptyOverrides(),
    sha: null,
  };

  function emptyOverrides() {
    return { apps: [], downloads: [], manuals: [], videos: [], products: [], manufacturers: [] };
  }

  /* ------------------------------------------------------------------ */
  /* Utilitários                                                        */
  /* ------------------------------------------------------------------ */
  function slugify(str) {
    return (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  function shortId(prefix, name) {
    return `${prefix}-${slugify(name) || "item"}-${Math.random().toString(36).slice(2, 7)}`;
  }
  function b64EncodeUtf8(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }
  function b64DecodeUtf8(b64) {
    const binary = atob(b64.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  function setStatus(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.className = "admin-status" + (kind ? " is-" + kind : "");
  }
  function csvToArray(str) {
    return (str || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  function linesToArray(str) {
    return (str || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /* ------------------------------------------------------------------ */
  /* API do GitHub                                                      */
  /* ------------------------------------------------------------------ */
  function ghHeaders(cfg) {
    return {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };
  }
  async function ghErrorFrom(res) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j && j.message) msg = j.message;
    } catch (e) {
      /* corpo não era JSON — mantém a mensagem padrão */
    }
    return new Error(msg);
  }
  async function ghGetOverrides(cfg) {
    const url = `${GH_API}/repos/${cfg.owner}/${cfg.repo}/contents/${FILE_PATH}?ref=${encodeURIComponent(cfg.branch)}`;
    const res = await fetch(url, { headers: ghHeaders(cfg) });
    if (res.status === 404) return { data: emptyOverrides(), sha: null };
    if (!res.ok) throw await ghErrorFrom(res);
    const json = await res.json();
    const text = b64DecodeUtf8(json.content);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("data/overrides.json existe no repositório mas não é um JSON válido.");
    }
    return { data: Object.assign(emptyOverrides(), data), sha: json.sha };
  }
  async function ghPutOverrides(cfg, data, sha, message) {
    const url = `${GH_API}/repos/${cfg.owner}/${cfg.repo}/contents/${FILE_PATH}`;
    const body = {
      message,
      content: b64EncodeUtf8(JSON.stringify(data, null, 2) + "\n"),
      branch: cfg.branch,
    };
    if (sha) body.sha = sha;
    const res = await fetch(url, { method: "PUT", headers: ghHeaders(cfg), body: JSON.stringify(body) });
    if (!res.ok) throw await ghErrorFrom(res);
    const json = await res.json();
    return json.content.sha;
  }

  /* ------------------------------------------------------------------ */
  /* Telas: PIN → Config do GitHub → Painel                             */
  /* ------------------------------------------------------------------ */
  const gateScreen = qs("#gateScreen");
  const configScreen = qs("#configScreen");
  const adminApp = qs("#adminApp");

  function showOnly(el) {
    [gateScreen, configScreen, adminApp].forEach((s) => (s.hidden = s !== el));
  }

  function loadSavedConfig() {
    try {
      const raw = localStorage.getItem(CFG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignora config salva corrompida */
    }
    return null;
  }

  function boot() {
    const isAuthed = sessionStorage.getItem(AUTH_KEY) === "1";
    if (!isAuthed) {
      showOnly(gateScreen);
      return;
    }
    const saved = loadSavedConfig();
    if (saved && saved.owner && saved.repo && saved.token) {
      STATE.cfg = saved;
      enterPanel();
    } else {
      prefillConfigForm();
      showOnly(configScreen);
    }
  }

  function prefillConfigForm() {
    const form = qs("#configForm");
    const defaults = (typeof EXATTA_CONFIG !== "undefined" && EXATTA_CONFIG.github) || {};
    const saved = loadSavedConfig() || {};
    form.owner.value = saved.owner || defaults.owner || "";
    form.repo.value = saved.repo || defaults.repo || "";
    form.branch.value = saved.branch || defaults.branch || "main";
  }

  qs("#pinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const val = qs("#pinInput").value;
    if (val === PIN) {
      sessionStorage.setItem(AUTH_KEY, "1");
      qs("#pinError").classList.remove("is-visible");
      const saved = loadSavedConfig();
      if (saved && saved.owner && saved.repo && saved.token) {
        STATE.cfg = saved;
        enterPanel();
      } else {
        prefillConfigForm();
        showOnly(configScreen);
      }
    } else {
      qs("#pinError").classList.add("is-visible");
      qs("#pinInput").value = "";
      qs("#pinInput").focus();
    }
  });

  qs("#backToPin").addEventListener("click", (e) => {
    e.preventDefault();
    showOnly(gateScreen);
  });

  qs("#configForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cfg = {
      owner: fd.get("owner").trim(),
      repo: fd.get("repo").trim(),
      branch: (fd.get("branch") || "main").trim(),
      token: fd.get("token").trim(),
    };
    STATE.cfg = cfg;
    if (fd.get("remember")) {
      localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
    } else {
      localStorage.removeItem(CFG_KEY);
    }
    qs("#configError").classList.remove("is-visible");
    enterPanel();
  });

  qs("#reconnectBtn").addEventListener("click", () => {
    localStorage.removeItem(CFG_KEY);
    STATE.cfg = null;
    prefillConfigForm();
    showOnly(configScreen);
  });

  qs("#logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(AUTH_KEY);
    showOnly(gateScreen);
    qs("#pinInput").value = "";
  });

  async function enterPanel() {
    showOnly(adminApp);
    qs("#repoLabel").textContent = `${STATE.cfg.owner}/${STATE.cfg.repo} @ ${STATE.cfg.branch}`;
    await loadFromGithub();
  }

  /* ------------------------------------------------------------------ */
  /* Carrega / publica data/overrides.json                              */
  /* ------------------------------------------------------------------ */
  const loadStatus = qs("#loadStatus");
  function showLoadStatus(html, kind) {
    loadStatus.hidden = false;
    loadStatus.className = "admin-banner" + (kind ? " is-" + kind : "");
    loadStatus.innerHTML = html;
  }
  function hideLoadStatus() {
    loadStatus.hidden = true;
  }

  async function loadFromGithub() {
    showLoadStatus("Carregando dados do repositório...", "");
    try {
      const { data, sha } = await ghGetOverrides(STATE.cfg);
      STATE.overrides = data;
      STATE.sha = sha;
      hideLoadStatus();
      SECTIONS.forEach(renderList);
      populateBrandDatalists();
    } catch (e) {
      showLoadStatus(
        `<i data-icon="alert"></i><div><strong>Não foi possível conectar ao GitHub.</strong><br>${escapeHtml(
          e.message
        )}<br>Confira usuário/repositório/branch e se o token tem permissão de leitura e escrita neste repositório. <button type="button" class="btn btn--outline btn--sm" id="retryLoad" style="margin-top:10px">Tentar de novo</button> <button type="button" class="btn btn--ghost btn--sm" id="fixConfig">Corrigir configuração</button></div>`,
        "error"
      );
      const retry = qs("#retryLoad");
      if (retry) retry.addEventListener("click", loadFromGithub);
      const fix = qs("#fixConfig");
      if (fix) fix.addEventListener("click", () => qs("#reconnectBtn").click());
      qsa("[data-icon]", loadStatus).forEach((el) => {
        el.innerHTML = window.exattaIcon(el.getAttribute("data-icon"));
      });
    }
  }

  function populateBrandDatalists() {
    const names = new Set();
    if (typeof MANUFACTURERS !== "undefined") MANUFACTURERS.forEach((m) => names.add(m.name));
    STATE.overrides.manufacturers.forEach((m) => names.add(m.name));
    const optionsHtml = Array.from(names)
      .sort()
      .map((n) => `<option value="${escapeHtml(n)}">`)
      .join("");
    ["brandOptions", "brandOptions2"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = optionsHtml;
    });
  }

  function escapeHtml(str) {
    return (str || "").toString().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ------------------------------------------------------------------ */
  /* Listas por seção                                                   */
  /* ------------------------------------------------------------------ */
  function itemLabel(section, item) {
    if (section === "manuals" || section === "videos") return `${item.brand} — ${item.model}`;
    if (section === "manufacturers") return `${item.name} (${item.count})`;
    return item.name;
  }
  function itemMeta(section, item) {
    if (section === "apps") return item.category;
    if (section === "downloads") return `${item.platform} · v${item.version}`;
    if (section === "manuals") return item.type || "";
    if (section === "videos") return item.desc || "";
    if (section === "products") return item.category || "";
    return "";
  }

  function renderList(section) {
    const el = document.getElementById("list-" + section);
    if (!el) return;
    const items = STATE.overrides[section] || [];
    if (!items.length) {
      el.innerHTML = `<p class="admin-empty">Nenhum item publicado pelo painel nesta seção ainda.</p>`;
      return;
    }
    el.innerHTML = items
      .map(
        (item) => `
      <div class="admin-row">
        <div>
          <strong>${escapeHtml(itemLabel(section, item))}</strong>
          <span>${escapeHtml(itemMeta(section, item))}</span>
        </div>
        <span class="badge badge--local">Publicado</span>
        <button type="button" class="btn btn--ghost btn--sm remove" data-remove="${escapeHtml(item.id)}">Remover</button>
      </div>`
      )
      .join("");
    qsa("[data-remove]", el).forEach((btn) => {
      btn.addEventListener("click", () => removeItem(section, btn.getAttribute("data-remove"), btn));
    });
  }

  async function removeItem(section, id, btn) {
    const idx = STATE.overrides[section].findIndex((i) => i.id === id);
    if (idx === -1) return;
    btn.disabled = true;
    btn.textContent = "Removendo...";
    const removed = STATE.overrides[section].splice(idx, 1)[0];
    try {
      const sha = await ghPutOverrides(STATE.cfg, STATE.overrides, STATE.sha, `Admin: remove item de ${section}`);
      STATE.sha = sha;
      renderList(section);
    } catch (e) {
      STATE.overrides[section].splice(idx, 0, removed);
      alert("Erro ao remover: " + e.message);
      renderList(section);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Formulários de adição                                              */
  /* ------------------------------------------------------------------ */
  function buildItem(section, fd) {
    switch (section) {
      case "apps":
        return {
          id: shortId("app", fd.get("name")),
          name: fd.get("name"),
          icon: fd.get("icon") || "scale",
          category: fd.get("category"),
          filters: [],
          shortDesc: fd.get("shortDesc"),
          fullDesc: fd.get("fullDesc") || fd.get("shortDesc"),
          features: linesToArray(fd.get("features")),
          tech: csvToArray(fd.get("tech")),
          compatibility: fd.get("compatibility") || "",
          version: fd.get("version") || "1.0.0",
          changelog: [],
          hasDownload: fd.get("hasDownload") === "on",
        };
      case "downloads":
        return {
          id: shortId("dl", fd.get("name")),
          name: fd.get("name"),
          platform: fd.get("platform") || "",
          type: fd.get("type") || "tool",
          version: fd.get("version") || "1.0.0",
          size: fd.get("size") || "",
          date: fd.get("date") || "",
          desc: fd.get("desc") || "",
          current: fd.get("current") === "on",
          url: fd.get("url"),
        };
      case "manuals":
        return {
          id: shortId("m", fd.get("model")),
          brand: fd.get("brand"),
          model: fd.get("model"),
          type: fd.get("type") || "",
          desc: fd.get("desc") || "",
          url: fd.get("url"),
          sourceUrl: fd.get("sourceUrl") || "",
        };
      case "videos":
        return {
          id: shortId("v", fd.get("model")),
          brand: fd.get("brand"),
          model: fd.get("model"),
          desc: fd.get("desc") || "",
          url: fd.get("url"),
        };
      case "products":
        return {
          id: shortId("prod", fd.get("name")),
          name: fd.get("name"),
          category: fd.get("category") || "",
          icon: fd.get("icon") || "package",
          price: null,
          priceLabel: fd.get("priceLabel") || "Consultar preço",
          desc: fd.get("desc") || "",
          availability: fd.get("availability") || "available",
        };
      case "manufacturers":
        return {
          id: slugify(fd.get("name")) || shortId("brand", fd.get("name")),
          name: fd.get("name"),
          count: parseInt(fd.get("count"), 10) || 0,
        };
      default:
        return null;
    }
  }

  qsa(".admin-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const section = form.getAttribute("data-section");
      const statusEl = form.querySelector("[data-status]");
      const submitBtn = form.querySelector('button[type="submit"]');
      const item = buildItem(section, new FormData(form));

      setStatus(statusEl, "Publicando no GitHub...", "busy");
      submitBtn.disabled = true;
      STATE.overrides[section].push(item);
      try {
        const sha = await ghPutOverrides(STATE.cfg, STATE.overrides, STATE.sha, `Admin: adiciona ${itemLabel(section, item)} (${section})`);
        STATE.sha = sha;
        setStatus(statusEl, "Publicado! O site deve atualizar em ~1 minuto.", "success");
        renderList(section);
        if (section === "manuals" || section === "videos" || section === "manufacturers") populateBrandDatalists();
        form.reset();
        if (form.querySelector('[name="current"]')) form.querySelector('[name="current"]').checked = true;
        if (form.querySelector('[name="hasDownload"]')) form.querySelector('[name="hasDownload"]').checked = true;
      } catch (err) {
        STATE.overrides[section].pop();
        setStatus(statusEl, "Erro ao publicar: " + err.message, "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Tabs                                                                */
  /* ------------------------------------------------------------------ */
  qsa(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-admin-tab");
      qsa(".admin-tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      qsa(".admin-panel").forEach((p) => p.classList.toggle("is-active", p.getAttribute("data-admin-panel") === target));
    });
  });

  /* ------------------------------------------------------------------ */
  /* Ícones (mesmo mapa usado em main.js — duplicado aqui pois esta      */
  /* página não carrega main.js)                                        */
  /* ------------------------------------------------------------------ */
  const ICONS = {
    shield: '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>',
    scale: '<path d="M12 3v18M5 8l-3 6a3.5 3.5 0 0 0 7 0l-3-6h6l-3 6a3.5 3.5 0 0 0 7 0l-3-6M5 8h3M16 8h3M8 21h8"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
    alert: '<path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/>',
  };
  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
      ICONS[name] || ""
    }</svg>`;
  }
  window.exattaIcon = icon;
  qsa("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.getAttribute("data-icon"));
    el.classList.add("icon");
  });

  boot();
})();
