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
  const BASE_VAR = {
    apps: "APPS",
    downloads: "DOWNLOADS",
    manuals: "MANUALS",
    videos: "MANUAL_VIDEOS",
    products: "PRODUCTS",
    manufacturers: "MANUFACTURERS",
  };
  const SUBMIT_LABEL = {
    apps: "Publicar aplicativo",
    downloads: "Publicar arquivo",
    manuals: "Publicar manuais",
    videos: "Publicar vídeo",
    products: "Publicar produto",
    manufacturers: "Publicar fabricante",
  };
  const FORM_TITLE = {
    apps: "Adicionar aplicativo",
    downloads: "Adicionar arquivo",
    manuals: "Adicionar manuais",
    videos: "Adicionar vídeo",
    products: "Adicionar produto",
    manufacturers: "Adicionar fabricante",
  };
  const SUPPORTS_IMAGE = { apps: true, downloads: true, products: true };
  const SUPPORTS_GALLERY = { products: true };
  const SUPPORTS_FILE = { downloads: true };
  const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
  const MAX_DOWNLOAD_BYTES = 40 * 1024 * 1024;

  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const STATE = {
    cfg: null, // { owner, repo, branch, token }
    overrides: emptyOverrides(),
    sha: null,
  };

  function emptyOverrides() {
    return {
      apps: [],
      downloads: [],
      manuals: [],
      videos: [],
      products: [],
      manufacturers: [],
      youtubeApiKey: "",
      removed: { apps: [], downloads: [], manuals: [], videos: [], products: [], manufacturers: [] },
    };
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
    const merged = emptyOverrides();
    Object.assign(merged, data);
    merged.removed = Object.assign(emptyOverrides().removed, data.removed || {});
    return { data: merged, sha: json.sha };
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
  /* Upload de imagens (arquivos binários) via API do GitHub            */
  /* ------------------------------------------------------------------ */
  async function ghGetFileSha(cfg, path) {
    const url = `${GH_API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`;
    const res = await fetch(url, { headers: ghHeaders(cfg) });
    if (res.status === 404) return null;
    if (!res.ok) throw await ghErrorFrom(res);
    const json = await res.json();
    return json.sha;
  }
  async function ghPutBinaryFile(cfg, path, base64Content, message) {
    const sha = await ghGetFileSha(cfg, path);
    const url = `${GH_API}/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
    const body = { message, content: base64Content, branch: cfg.branch };
    if (sha) body.sha = sha;
    const res = await fetch(url, { method: "PUT", headers: ghHeaders(cfg), body: JSON.stringify(body) });
    if (!res.ok) throw await ghErrorFrom(res);
    return path;
  }
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = () => reject(new Error("Não foi possível ler o arquivo selecionado."));
      reader.readAsDataURL(file);
    });
  }
  async function resolveImage(section, id, fd) {
    if (!SUPPORTS_IMAGE[section]) return undefined;
    const file = fd.get("imageFile");
    if (file && file.size > 0) {
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error("Imagem muito grande (máx. 3 MB). Reduza o tamanho e tente de novo.");
      }
      const base64 = await readFileAsBase64(file);
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `assets/uploads/${section}-${id}.${ext}`;
      const label = fd.get("name") || fd.get("model") || id;
      await ghPutBinaryFile(STATE.cfg, path, base64, `Admin: imagem de ${label}`);
      return `${path}?v=${Date.now()}`;
    }
    return (fd.get("imageUrl") || "").trim();
  }
  async function resolveGallery(section, id, fd) {
    if (!SUPPORTS_GALLERY[section]) return undefined;
    const files = (fd.getAll("galleryFiles") || []).filter((f) => f && f.size > 0);
    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error(`Foto da galeria muito grande (máx. 3 MB): ${file.name}`);
      }
      const base64 = await readFileAsBase64(file);
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `assets/uploads/${section}-${id}-gallery-${Date.now()}-${i}.${ext}`;
      const label = fd.get("name") || id;
      await ghPutBinaryFile(STATE.cfg, path, base64, `Admin: foto da galeria de ${label}`);
      uploaded.push(`${path}?v=${Date.now()}`);
    }
    return uploaded.concat(linesToArray(fd.get("galleryUrls")));
  }
  async function resolveDownloadFile(section, id, fd) {
    if (!SUPPORTS_FILE[section]) return undefined;
    const file = fd.get("fileFile");
    if (file && file.size > 0) {
      if (file.size > MAX_DOWNLOAD_BYTES) {
        throw new Error("Arquivo muito grande (máx. 40 MB). Hospede em outro lugar (Google Drive, etc.) e cole o link.");
      }
      const base64 = await readFileAsBase64(file);
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `assets/uploads/${section}-${id}.${ext}`;
      const label = fd.get("name") || id;
      await ghPutBinaryFile(STATE.cfg, path, base64, `Admin: arquivo de ${label}`);
      return `${path}?v=${Date.now()}`;
    }
    return (fd.get("url") || "").trim();
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
      const ytField = qs('#form-settings [name="youtubeApiKey"]');
      if (ytField) ytField.value = STATE.overrides.youtubeApiKey || "";
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
  /* Combina dados padrão (js/data.js) + overrides para exibição        */
  /* ------------------------------------------------------------------ */
  function effectiveList(section) {
    const baseArr = (typeof window[BASE_VAR[section]] !== "undefined" && window[BASE_VAR[section]]) || [];
    const overrideArr = STATE.overrides[section] || [];
    const removedIds = (STATE.overrides.removed && STATE.overrides.removed[section]) || [];
    const map = new Map();
    baseArr.forEach((item) => {
      if (!removedIds.includes(item.id)) map.set(item.id, { item, kind: "base" });
    });
    // Um item presente em overrides sempre aparece, mesmo que sua id também
    // esteja (por engano/dado antigo) na lista de removidos — do contrário
    // ele fica editado/publicado no site mas some da tela do admin.
    overrideArr.forEach((item) => {
      map.set(item.id, { item, kind: map.has(item.id) ? "edited" : "new" });
    });
    return Array.from(map.values());
  }

  function findItem(section, id) {
    const entry = effectiveList(section).find((e) => e.item.id === id);
    return entry ? entry.item : null;
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
  const KIND_LABEL = { base: "Padrão", edited: "Editado", new: "Novo" };

  function rowHtml(section, item, kind) {
    return `
      <div class="admin-row">
        <div>
          <strong>${escapeHtml(itemLabel(section, item))}</strong>
          <span>${escapeHtml(itemMeta(section, item))}</span>
        </div>
        <span class="badge badge--${kind}">${KIND_LABEL[kind]}</span>
        <div class="actions">
          <button type="button" class="btn btn--outline btn--sm" data-edit="${escapeHtml(item.id)}">Editar</button>
          <button type="button" class="btn btn--ghost btn--sm" data-remove="${escapeHtml(item.id)}">Remover</button>
        </div>
      </div>`;
  }

  function bindRowActions(section, el) {
    qsa("[data-edit]", el).forEach((btn) => {
      btn.addEventListener("click", () => startEdit(section, btn.getAttribute("data-edit")));
    });
    qsa("[data-remove]", el).forEach((btn) => {
      btn.addEventListener("click", () => removeItem(section, btn.getAttribute("data-remove"), btn));
    });
  }

  function renderList(section) {
    const el = document.getElementById("list-" + section);
    if (!el) return;
    const entries = effectiveList(section);
    if (!entries.length) {
      el.innerHTML = `<p class="admin-empty">Nenhum item nesta seção.</p>`;
      return;
    }

    if (section === "manuals") {
      // Agrupado por marca (aberto/fechado com <details>) — uma lista só
      // fica ilegível quando há muitos manuais.
      const groups = new Map();
      entries.forEach((entry) => {
        const brand = entry.item.brand || "Sem marca";
        if (!groups.has(brand)) groups.set(brand, []);
        groups.get(brand).push(entry);
      });
      const brands = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b, "pt-BR"));
      el.innerHTML = brands
        .map((brand) => {
          const items = groups.get(brand);
          const rows = items.map(({ item, kind }) => rowHtml(section, item, kind)).join("");
          return `
        <details class="admin-brand-group">
          <summary>${escapeHtml(brand)} <span class="count">(${items.length})</span></summary>
          <div class="admin-brand-group-body">${rows}</div>
        </details>`;
        })
        .join("");
      bindRowActions(section, el);
      return;
    }

    el.innerHTML = entries.map(({ item, kind }) => rowHtml(section, item, kind)).join("");
    bindRowActions(section, el);
  }

  async function removeItem(section, id, btn) {
    btn.disabled = true;
    btn.textContent = "Removendo...";
    const arr = STATE.overrides[section];
    const idx = arr.findIndex((i) => i.id === id);
    const removedOverrideItem = idx !== -1 ? arr.splice(idx, 1)[0] : null;
    const alreadyMarkedRemoved = STATE.overrides.removed[section].includes(id);
    if (!alreadyMarkedRemoved) STATE.overrides.removed[section].push(id);
    try {
      const sha = await ghPutOverrides(STATE.cfg, STATE.overrides, STATE.sha, `Admin: remove item de ${section}`);
      STATE.sha = sha;
      renderList(section);
    } catch (e) {
      if (removedOverrideItem) arr.splice(idx, 0, removedOverrideItem);
      if (!alreadyMarkedRemoved) STATE.overrides.removed[section].pop();
      alert("Erro ao remover: " + e.message);
      renderList(section);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Modo edição                                                        */
  /* ------------------------------------------------------------------ */
  function formEl(section) {
    return document.getElementById("form-" + section);
  }

  function fillForm(section, item) {
    const form = formEl(section);
    form.reset();
    switch (section) {
      case "apps":
        form.name.value = item.name || "";
        form.category.value = item.category || "";
        form.icon.value = item.icon || "scale";
        form.version.value = item.version || "";
        form.compatibility.value = item.compatibility || "";
        form.tech.value = (item.tech || []).join(", ");
        form.filters.value = (item.filters || []).join(", ");
        form.shortDesc.value = item.shortDesc || "";
        form.fullDesc.value = item.fullDesc || "";
        form.features.value = (item.features || []).join("\n");
        form.hasDownload.checked = !!item.hasDownload;
        break;
      case "downloads":
        form.name.value = item.name || "";
        form.type.value = item.type || "android";
        form.platform.value = item.platform || "";
        form.version.value = item.version || "";
        form.size.value = item.size || "";
        form.date.value = item.date || "";
        form.desc.value = item.desc || "";
        form.url.value = item.url || "";
        form.current.checked = !!item.current;
        updateCurrentFileHint("downloads", item.url || "");
        break;
      case "videos":
        form.brand.value = item.brand || "";
        form.model.value = item.model || "";
        form.desc.value = item.desc || "";
        form.url.value = item.url || "";
        break;
      case "products":
        form.name.value = item.name || "";
        form.category.value = item.category || "";
        form.icon.value = item.icon || "package";
        form.availability.value = item.availability || "available";
        form.desc.value = item.desc || "";
        form.priceLabel.value = item.priceLabel || "Consultar preço";
        form.videoUrls.value = (item.videos || (item.videoUrl ? [item.videoUrl] : [])).join("\n");
        form.galleryUrls.value = (item.gallery || []).join("\n");
        updateGalleryPreview("products", item.gallery || []);
        break;
      case "manufacturers":
        form.name.value = item.name || "";
        form.count.value = item.count != null ? item.count : 1;
        break;
    }
    if (SUPPORTS_IMAGE[section]) {
      form.imageUrl.value = item.image || "";
      updateImagePreview(section, item.image || "");
    }
  }

  function updateImagePreview(section, url) {
    const img = document.querySelector(`[data-image-preview="${section}"]`);
    if (!img) return;
    if (url) {
      img.src = url;
      img.classList.add("is-visible");
    } else {
      img.removeAttribute("src");
      img.classList.remove("is-visible");
    }
  }

  qsa("[data-image-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const section = input.getAttribute("data-image-input");
      const file = input.files && input.files[0];
      if (file) updateImagePreview(section, URL.createObjectURL(file));
    });
  });
  qsa('input[name="imageUrl"]').forEach((input) => {
    input.addEventListener("input", () => {
      const section = input.form.getAttribute("data-section");
      const fileInput = input.form.querySelector('[name="imageFile"]');
      if (!fileInput || !fileInput.files.length) updateImagePreview(section, input.value.trim());
    });
  });

  function updateGalleryPreview(section, urls) {
    const wrap = document.querySelector(`[data-gallery-preview="${section}"]`);
    if (!wrap) return;
    wrap.innerHTML = urls.map((u) => `<img src="${u}" alt="">`).join("");
  }
  function updateCurrentFileHint(section, url) {
    const hint = document.querySelector(`[data-current-file="${section}"]`);
    if (!hint) return;
    const link = hint.querySelector("a");
    if (url) {
      link.href = url;
      link.textContent = url;
      hint.hidden = false;
    } else {
      hint.hidden = true;
    }
  }
  qsa("[data-file-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const section = input.getAttribute("data-file-input");
      updateCurrentFileHint(section, "");
    });
  });
  qsa("[data-gallery-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const section = input.getAttribute("data-gallery-input");
      const form = input.form;
      const fileUrls = Array.from(input.files || []).map((f) => URL.createObjectURL(f));
      const pastedUrls = linesToArray(form.querySelector('[name="galleryUrls"]').value);
      updateGalleryPreview(section, fileUrls.concat(pastedUrls));
    });
  });
  qsa('textarea[name="galleryUrls"]').forEach((textarea) => {
    textarea.addEventListener("input", () => {
      const section = textarea.form.getAttribute("data-section");
      const fileInput = textarea.form.querySelector('[name="galleryFiles"]');
      const fileUrls = fileInput && fileInput.files.length ? Array.from(fileInput.files).map((f) => URL.createObjectURL(f)) : [];
      updateGalleryPreview(section, fileUrls.concat(linesToArray(textarea.value)));
    });
  });

  function startEdit(section, id) {
    const item = findItem(section, id);
    if (!item) return;
    if (section === "manuals") {
      startEditManual(item);
      return;
    }
    const form = formEl(section);
    fillForm(section, item);
    form.dataset.editingId = id;
    qs("[data-form-title]", form).textContent = `Editando: ${itemLabel(section, item)}`;
    qs("[data-submit-label]", form).textContent = "Salvar alterações";
    qs("[data-cancel-edit]", form).hidden = false;
    setStatus(qs("[data-status]", form), "", "");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit(section) {
    const form = formEl(section);
    form.reset();
    delete form.dataset.editingId;
    qs("[data-form-title]", form).textContent = FORM_TITLE[section];
    qs("[data-submit-label]", form).textContent = SUBMIT_LABEL[section];
    qs("[data-cancel-edit]", form).hidden = true;
    if (form.querySelector('[name="current"]')) form.current.checked = true;
    if (form.querySelector('[name="hasDownload"]')) form.hasDownload.checked = true;
    if (SUPPORTS_IMAGE[section]) updateImagePreview(section, "");
    if (SUPPORTS_GALLERY[section]) updateGalleryPreview(section, []);
    if (SUPPORTS_FILE[section]) updateCurrentFileHint(section, "");
    if (section === "manuals") {
      resetManualRows();
      document.getElementById("addManualRow").hidden = false;
    }
  }

  qsa("[data-cancel-edit]").forEach((btn) => {
    btn.addEventListener("click", () => cancelEdit(btn.closest("form").getAttribute("data-section")));
  });

  /* ------------------------------------------------------------------ */
  /* Manuais — marca única + várias linhas de modelo/manual de uma vez  */
  /* ------------------------------------------------------------------ */
  function createManualRow(prefill) {
    const row = document.createElement("div");
    row.className = "admin-manual-row";
    row.innerHTML = `
      <div class="form-grid">
        <div class="field"><label>Modelo</label><input class="f-model" required placeholder="Ex: Prix 4 Uno"></div>
        <div class="field"><label>Tipo de equipamento</label><input class="f-type" value="Balança" placeholder="Ex: Indicador digital"></div>
        <div class="field full"><label>Descrição</label><input class="f-desc" value="Manual do usuário" placeholder="O que o manual cobre"></div>
        <div class="field"><label>Link do PDF</label><input class="f-url" required placeholder="https://..."></div>
        <div class="field"><label>Link da fonte (opcional)</label><input class="f-sourceUrl" placeholder="https://..."></div>
      </div>
      <button type="button" class="btn btn--ghost btn--sm remove-row">Remover esta linha</button>
    `;
    if (prefill) {
      row.querySelector(".f-model").value = prefill.model || "";
      row.querySelector(".f-type").value = prefill.type || "";
      row.querySelector(".f-desc").value = prefill.desc || "";
      row.querySelector(".f-url").value = prefill.url || "";
      row.querySelector(".f-sourceUrl").value = prefill.sourceUrl || "";
    }
    row.querySelector(".remove-row").addEventListener("click", () => {
      const rows = qsa(".admin-manual-row", document.getElementById("manualRows"));
      if (rows.length > 1) row.remove();
    });
    return row;
  }

  function addManualRow(prefill) {
    document.getElementById("manualRows").appendChild(createManualRow(prefill));
  }

  function resetManualRows() {
    const container = document.getElementById("manualRows");
    container.innerHTML = "";
    addManualRow();
  }

  const addManualRowBtn = document.getElementById("addManualRow");
  if (addManualRowBtn) addManualRowBtn.addEventListener("click", () => addManualRow());
  if (document.getElementById("manualRows")) resetManualRows();

  function startEditManual(item) {
    const form = formEl("manuals");
    form.querySelector('[name="brand"]').value = item.brand || "";
    const container = document.getElementById("manualRows");
    container.innerHTML = "";
    container.appendChild(createManualRow(item));
    document.getElementById("addManualRow").hidden = true;
    form.dataset.editingId = item.id;
    qs("[data-form-title]", form).textContent = `Editando: ${item.brand} — ${item.model}`;
    qs("[data-submit-label]", form).textContent = "Salvar alterações";
    qs("[data-cancel-edit]", form).hidden = false;
    setStatus(qs("[data-status]", form), "", "");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  qs("#form-manuals").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const statusEl = qs("[data-status]", form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const brand = form.querySelector('[name="brand"]').value.trim();
    const editingId = form.dataset.editingId || null;

    if (!brand) {
      setStatus(statusEl, "Informe o fabricante.", "error");
      return;
    }

    const rows = qsa(".admin-manual-row", document.getElementById("manualRows"));
    const items = [];
    for (const row of rows) {
      const model = row.querySelector(".f-model").value.trim();
      const url = row.querySelector(".f-url").value.trim();
      if (!model || !url) continue;
      items.push({
        id: editingId || shortId("m", model),
        brand,
        model,
        type: row.querySelector(".f-type").value.trim(),
        desc: row.querySelector(".f-desc").value.trim(),
        url,
        sourceUrl: row.querySelector(".f-sourceUrl").value.trim(),
      });
    }

    if (!items.length) {
      setStatus(statusEl, "Preencha ao menos um modelo com o link do PDF.", "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus(statusEl, editingId ? "Salvando alterações..." : `Publicando ${items.length} manual(is)...`, "busy");

    const arr = STATE.overrides.manuals;
    const snapshot = arr.slice();
    items.forEach((item) => {
      const idx = arr.findIndex((i) => i.id === item.id);
      if (idx !== -1) arr[idx] = item;
      else arr.push(item);
    });

    const removedArr = STATE.overrides.removed.manuals;
    const removedSnapshot = removedArr.slice();
    items.forEach((item) => {
      const idx = removedArr.indexOf(item.id);
      if (idx !== -1) removedArr.splice(idx, 1);
    });

    try {
      const message = editingId
        ? `Admin: edita ${brand} — ${items[0].model} (manuals)`
        : `Admin: adiciona ${items.length} manual(is) de ${brand}`;
      const sha = await ghPutOverrides(STATE.cfg, STATE.overrides, STATE.sha, message);
      STATE.sha = sha;
      setStatus(statusEl, "Publicado! O site deve atualizar em ~1 minuto.", "success");
      cancelEdit("manuals");
      renderList("manuals");
      populateBrandDatalists();
    } catch (err) {
      STATE.overrides.manuals = snapshot;
      STATE.overrides.removed.manuals = removedSnapshot;
      setStatus(statusEl, "Erro ao publicar: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ------------------------------------------------------------------ */
  /* Formulários de adição/edição                                       */
  /* ------------------------------------------------------------------ */
  function buildItem(section, fd, existing) {
    const carry = existing ? Object.assign({}, existing) : {};
    switch (section) {
      case "apps":
        return Object.assign(carry, {
          name: fd.get("name"),
          icon: fd.get("icon") || "scale",
          category: fd.get("category"),
          filters: csvToArray(fd.get("filters")),
          shortDesc: fd.get("shortDesc"),
          fullDesc: fd.get("fullDesc") || fd.get("shortDesc"),
          features: linesToArray(fd.get("features")),
          tech: csvToArray(fd.get("tech")),
          compatibility: fd.get("compatibility") || "",
          version: fd.get("version") || "1.0.0",
          hasDownload: fd.get("hasDownload") === "on",
        });
      case "downloads":
        return Object.assign(carry, {
          name: fd.get("name"),
          platform: fd.get("platform") || "",
          type: fd.get("type") || "tool",
          version: fd.get("version") || "1.0.0",
          size: fd.get("size") || "",
          date: fd.get("date") || "",
          desc: fd.get("desc") || "",
          current: fd.get("current") === "on",
        });
      case "videos":
        return Object.assign(carry, {
          brand: fd.get("brand"),
          model: fd.get("model"),
          desc: fd.get("desc") || "",
          url: fd.get("url"),
        });
      case "products":
        return Object.assign(carry, {
          name: fd.get("name"),
          category: fd.get("category") || "",
          icon: fd.get("icon") || "package",
          price: null,
          priceLabel: fd.get("priceLabel") || "Consultar preço",
          desc: fd.get("desc") || "",
          availability: fd.get("availability") || "available",
          videos: linesToArray(fd.get("videoUrls")),
        });
      case "manufacturers":
        return Object.assign(carry, {
          name: fd.get("name"),
          count: parseInt(fd.get("count"), 10) || 0,
        });
      default:
        return null;
    }
  }

  function generateId(section, fd) {
    switch (section) {
      case "apps":
        return shortId("app", fd.get("name"));
      case "downloads":
        return shortId("dl", fd.get("name"));
      case "videos":
        return shortId("v", fd.get("model"));
      case "products":
        return shortId("prod", fd.get("name"));
      case "manufacturers":
        return slugify(fd.get("name")) || shortId("brand", fd.get("name"));
      default:
        return shortId("item", "");
    }
  }

  qsa('.admin-form:not(#form-manuals)').forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const section = form.getAttribute("data-section");
      const statusEl = form.querySelector("[data-status]");
      const submitBtn = form.querySelector('button[type="submit"]');
      const editingId = form.dataset.editingId || null;
      const existing = editingId ? findItem(section, editingId) : null;
      const fd = new FormData(form);
      const id = editingId || generateId(section, fd);

      submitBtn.disabled = true;
      let image;
      if (SUPPORTS_IMAGE[section]) {
        setStatus(statusEl, "Enviando imagem...", "busy");
        try {
          image = await resolveImage(section, id, fd);
        } catch (imgErr) {
          setStatus(statusEl, imgErr.message, "error");
          submitBtn.disabled = false;
          return;
        }
      }
      let gallery;
      if (SUPPORTS_GALLERY[section]) {
        setStatus(statusEl, "Enviando fotos da galeria...", "busy");
        try {
          gallery = await resolveGallery(section, id, fd);
        } catch (galErr) {
          setStatus(statusEl, galErr.message, "error");
          submitBtn.disabled = false;
          return;
        }
      }
      let downloadUrl;
      if (SUPPORTS_FILE[section]) {
        setStatus(statusEl, "Enviando arquivo...", "busy");
        try {
          downloadUrl = await resolveDownloadFile(section, id, fd);
        } catch (fileErr) {
          setStatus(statusEl, fileErr.message, "error");
          submitBtn.disabled = false;
          return;
        }
        if (!downloadUrl) {
          setStatus(statusEl, "Escolha um arquivo para upload ou cole um link direto.", "error");
          submitBtn.disabled = false;
          return;
        }
      }

      const item = buildItem(section, fd, existing);
      item.id = id;
      if (image !== undefined) item.image = image;
      if (gallery !== undefined) item.gallery = gallery;
      if (downloadUrl !== undefined) item.url = downloadUrl;

      setStatus(statusEl, editingId ? "Salvando alterações..." : "Publicando no GitHub...", "busy");

      const arr = STATE.overrides[section];
      const idxInOverrides = arr.findIndex((i) => i.id === item.id);
      const prevOverrideSnapshot = idxInOverrides !== -1 ? arr[idxInOverrides] : null;
      if (idxInOverrides !== -1) arr[idxInOverrides] = item;
      else arr.push(item);

      // Publicar/editar um item sempre "desremove" ele — evita que fique
      // marcado como removido e ao mesmo tempo presente em overrides (o que
      // faz ele sumir do admin mas continuar aparecendo no site, ou vice-versa).
      const removedArr = STATE.overrides.removed[section];
      const removedIdx = removedArr.indexOf(item.id);
      if (removedIdx !== -1) removedArr.splice(removedIdx, 1);

      try {
        const sha = await ghPutOverrides(
          STATE.cfg,
          STATE.overrides,
          STATE.sha,
          `Admin: ${editingId ? "edita" : "adiciona"} ${itemLabel(section, item)} (${section})`
        );
        STATE.sha = sha;
        setStatus(statusEl, "Publicado! O site deve atualizar em ~1 minuto.", "success");
        cancelEdit(section);
        renderList(section);
        if (section === "manuals" || section === "videos" || section === "manufacturers") populateBrandDatalists();
      } catch (err) {
        if (idxInOverrides !== -1) arr[idxInOverrides] = prevOverrideSnapshot;
        else arr.pop();
        if (removedIdx !== -1) removedArr.splice(removedIdx, 0, item.id);
        setStatus(statusEl, "Erro ao publicar: " + err.message, "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Configurações                                                       */
  /* ------------------------------------------------------------------ */
  const settingsForm = qs("#form-settings");
  if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = qs("[data-status]", settingsForm);
      const submitBtn = settingsForm.querySelector('button[type="submit"]');
      const newKey = settingsForm.querySelector('[name="youtubeApiKey"]').value.trim();
      const prevKey = STATE.overrides.youtubeApiKey || "";

      submitBtn.disabled = true;
      setStatus(statusEl, "Salvando...", "busy");
      STATE.overrides.youtubeApiKey = newKey;

      try {
        const sha = await ghPutOverrides(STATE.cfg, STATE.overrides, STATE.sha, "Admin: atualiza configurações");
        STATE.sha = sha;
        setStatus(statusEl, "Salvo! O site deve atualizar em ~1 minuto.", "success");
      } catch (err) {
        STATE.overrides.youtubeApiKey = prevKey;
        setStatus(statusEl, "Erro ao salvar: " + err.message, "error");
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

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
