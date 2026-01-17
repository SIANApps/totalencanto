/**
 * Total Encanto — Admin (LocalStorage)
 */

const STORAGE_KEY = "total-encanto:products:v1";

// Produtos de exemplo (usados no reset)
const DEFAULT_PRODUTOS = {
  academia: [
    {
      id: makeId(),
      nome: "Conjunto Fitness Nude Glow",
      desc: "Tecido encorpado e confortável, ideal para treinos com estilo.",
      tag: "Alta sustentação",
      img: placeholderImage("Nude Glow", "#e7c7ad", "#c8a27a"),
    },
    {
      id: makeId(),
      nome: "Legging Cintura Alta Rose",
      desc: "Modelagem que valoriza e acompanha seus movimentos.",
      tag: "Cintura alta",
      img: placeholderImage("Legging Rose", "#f1e3d7", "#e7c7ad"),
    },
    {
      id: makeId(),
      nome: "Top Elegance Fit",
      desc: "Recortes delicados e toque macio para o dia a dia.",
      tag: "Conforto",
      img: placeholderImage("Elegance Fit", "#fbf8f5", "#c8a27a"),
    },
  ],
  praia: [
    {
      id: makeId(),
      nome: "Biquíni Golden Nude",
      desc: "Acabamento sofisticado e caimento que realça a beleza natural.",
      tag: "Charmoso",
      img: placeholderImage("Golden Nude", "#e7c7ad", "#f1e3d7"),
    },
    {
      id: makeId(),
      nome: "Maiô Power Elegance",
      desc: "Elegância atemporal com toque moderno e confortável.",
      tag: "Modelador",
      img: placeholderImage("Power Elegance", "#c8a27a", "#fbf8f5"),
    },
    {
      id: makeId(),
      nome: "Saída de Praia Soft",
      desc: "Leve, fluida e perfeita para compor looks de verão.",
      tag: "Levinha",
      img: placeholderImage("Soft", "#f1e3d7", "#fbf8f5"),
    },
  ],
  lingerie: [
    {
      id: makeId(),
      nome: "Conjunto Renda Delicata",
      desc: "Renda delicada e elegante — sensual na medida certa.",
      tag: "Renda",
      img: placeholderImage("Delicata", "#fbf8f5", "#e7c7ad"),
    },
    {
      id: makeId(),
      nome: "Body Nude Lux",
      desc: "Versátil, perfeito para usar por baixo ou como peça principal.",
      tag: "Luxo",
      img: placeholderImage("Nude Lux", "#e7c7ad", "#c8a27a"),
    },
    {
      id: makeId(),
      nome: "Sutiã Conforto Premium",
      desc: "Toque macio e sustentação para o dia a dia.",
      tag: "Premium",
      img: placeholderImage("Premium", "#f1e3d7", "#e7c7ad"),
    },
  ],
  sexshop: [
    {
      id: makeId(),
      nome: "Óleo Massageador Aromático",
      desc: "Sensação suave e perfumada — ideal para momentos especiais.",
      tag: "Bem-estar",
      img: placeholderImage("Massagem", "#fbf8f5", "#c8a27a"),
    },
    {
      id: makeId(),
      nome: "Vela de Massagem (Aroma)",
      desc: "Aquece levemente e vira óleo — toque sofisticado e sensorial.",
      tag: "Sensorial",
      img: placeholderImage("Vela", "#e7c7ad", "#fbf8f5"),
    },
    {
      id: makeId(),
      nome: "Kit Intimidade Discreta",
      desc: "Produtos selecionados com descrição e praticidade.",
      tag: "Discreto",
      img: placeholderImage("Kit", "#f1e3d7", "#c8a27a"),
    },
  ],
};

let state = loadProducts();

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const form = byId("formProduto");
  const produtoId = byId("produtoId");
  const categoria = byId("categoria");
  const nome = byId("nome");
  const desc = byId("desc");
  const tag = byId("tag");
  const imgUrl = byId("imgUrl");
  const imgFile = byId("imgFile");

  const btnCancelar = byId("btnCancelar");
  const btnReset = byId("btnReset");
  const btnExportar = byId("btnExportar");
  const importFile = byId("importFile");

  const filtroCategoria = byId("filtroCategoria");
  const listaProdutos = byId("listaProdutos");

  // Preview
  const previewThumb = byId("previewThumb");
  const previewName = byId("previewName");
  const previewDesc = byId("previewDesc");

  function updatePreview() {
    const label = nome.value?.trim() || "Prévia do nome";
    previewName.textContent = label;
    previewDesc.textContent = desc.value?.trim() || "Prévia da descrição";

    const url = imgUrl.value?.trim();
    if (url) {
      previewThumb.style.backgroundImage = `url("${cssEscape(url)}")`;
      previewThumb.classList.add("has-img");
    } else {
      previewThumb.style.backgroundImage = "";
      previewThumb.classList.remove("has-img");
    }
  }

  ["input", "change"].forEach((evt) => {
    nome.addEventListener(evt, updatePreview);
    desc.addEventListener(evt, updatePreview);
    imgUrl.addEventListener(evt, updatePreview);
  });
  updatePreview();

  function clearForm() {
    produtoId.value = "";
    categoria.value = "academia";
    nome.value = "";
    desc.value = "";
    tag.value = "";
    imgUrl.value = "";
    imgFile.value = "";
    updatePreview();
  }

  function setEditing(product) {
    produtoId.value = product.id || "";
    categoria.value = product.categoryKey;
    nome.value = product.nome || "";
    desc.value = product.desc || "";
    tag.value = product.tag || "";
    imgUrl.value = isDataUrl(product.img) ? "" : product.img || "";
    imgFile.value = "";
    updatePreview();
    window.location.hash = "#cadastro";
  }

  function renderList() {
    const f = filtroCategoria.value;
    const items = flattenState(state)
      .filter((p) => (f === "todas" ? true : p.categoryKey === f))
      .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));

    if (!items.length) {
      listaProdutos.innerHTML = `<div class="empty">Nenhum produto cadastrado ainda.</div>`;
      return;
    }

    listaProdutos.innerHTML = items
      .map((p) => {
        const thumb = p.img || placeholderImage(p.nome || "Produto", "#f1e3d7", "#e7c7ad");
        return `
          <div class="admin-item" role="listitem" data-id="${escapeHtml(p.id)}" data-cat="${escapeHtml(
          p.categoryKey
        )}">
            <div class="admin-item-thumb">
              <img src="${thumb}" alt="${escapeHtml(p.nome)}" loading="lazy" />
            </div>
            <div class="admin-item-meta">
              <div class="admin-item-top">
                <div class="admin-item-name">${escapeHtml(p.nome)}</div>
                <span class="pill">${escapeHtml(humanCategory(p.categoryKey))}</span>
              </div>
              <div class="admin-item-desc">${escapeHtml(p.desc)}</div>
              <div class="admin-item-actions">
                <button class="mini" type="button" data-action="up">↑</button>
                <button class="mini" type="button" data-action="down">↓</button>
                <button class="mini" type="button" data-action="edit">Editar</button>
                <button class="mini danger" type="button" data-action="delete">Excluir</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  filtroCategoria.addEventListener("change", renderList);

  listaProdutos.addEventListener("click", (e) => {
    const btn = e.target?.closest("button[data-action]");
    const item = e.target?.closest(".admin-item");
    if (!btn || !item) return;

    const action = btn.getAttribute("data-action");
    const id = item.getAttribute("data-id");
    const cat = item.getAttribute("data-cat");

    if (!action || !id || !cat) return;

    if (action === "edit") {
      const p = getById(state, cat, id);
      if (p) setEditing({ ...p, categoryKey: cat });
      return;
    }

    if (action === "delete") {
      const ok = confirm("Excluir este produto?");
      if (!ok) return;
      state = removeById(state, cat, id);
      saveProducts(state);
      renderList();
      return;
    }

    if (action === "up" || action === "down") {
      state = moveItem(state, cat, id, action === "up" ? -1 : 1);
      saveProducts(state);
      renderList();
      return;
    }
  });

  btnCancelar.addEventListener("click", clearForm);

  btnReset.addEventListener("click", () => {
    const ok = confirm("Resetar para os produtos de exemplo? Isso substitui seus produtos atuais.");
    if (!ok) return;
    state = deepClone(DEFAULT_PRODUTOS);
    normalizeStateIds(state);
    saveProducts(state);
    clearForm();
    renderList();
  });

  btnExportar.addEventListener("click", () => {
    const data = JSON.stringify(state, null, 2);
    downloadTextFile(data, `total-encanto-produtos-${new Date().toISOString().slice(0, 10)}.json`);
  });

  importFile.addEventListener("change", async () => {
    const file = importFile.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const validated = validateState(json);
      state = validated;
      saveProducts(state);
      clearForm();
      renderList();
      alert("Importado com sucesso!");
    } catch (err) {
      alert("Falha ao importar. Verifique se o arquivo JSON está correto.");
    } finally {
      importFile.value = "";
    }
  });

  imgFile.addEventListener("change", async () => {
    const file = imgFile.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    imgUrl.value = dataUrl;
    updatePreview();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoryKey = categoria.value;
    const id = (produtoId.value || "").trim() || makeId();

    const produto = {
      id,
      nome: nome.value.trim(),
      desc: desc.value.trim(),
      tag: tag.value.trim() || "Selecionado",
      img: (imgUrl.value || "").trim() || placeholderImage(nome.value.trim() || "Produto", "#f1e3d7", "#e7c7ad"),
    };

    if (!produto.nome || !produto.desc) {
      alert("Preencha nome e descrição.");
      return;
    }

    // Atualiza/insere
    state = upsert(state, categoryKey, produto);
    saveProducts(state);

    clearForm();
    renderList();
    alert("Produto salvo!");
  });

  // Inicial
  normalizeStateIds(state);
  saveProducts(state); // garante estrutura normalizada
  renderList();
});

// =========================
// STORAGE
// =========================
function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(DEFAULT_PRODUTOS);
    const json = JSON.parse(raw);
    return validateState(json);
  } catch {
    return deepClone(DEFAULT_PRODUTOS);
  }
}

function saveProducts(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function validateState(obj) {
  const base = { academia: [], praia: [], lingerie: [], sexshop: [] };
  const out = { ...base };
  if (!obj || typeof obj !== "object") return deepClone(DEFAULT_PRODUTOS);

  Object.keys(base).forEach((k) => {
    const arr = Array.isArray(obj[k]) ? obj[k] : [];
    out[k] = arr
      .filter((p) => p && typeof p === "object")
      .map((p, i) => ({
        id: String(p.id || makeId()),
        nome: String(p.nome || "").slice(0, 120),
        desc: String(p.desc || "").slice(0, 240),
        tag: String(p.tag || "Selecionado").slice(0, 40),
        img: String(p.img || ""),
        sortIndex: typeof p.sortIndex === "number" ? p.sortIndex : i,
      }));
  });

  return out;
}

function normalizeStateIds(obj) {
  const seen = new Set();
  Object.keys(obj).forEach((k) => {
    obj[k].forEach((p, idx) => {
      if (!p.id || seen.has(p.id)) p.id = makeId();
      seen.add(p.id);
      if (typeof p.sortIndex !== "number") p.sortIndex = idx;
    });
  });
}

function flattenState(obj) {
  const res = [];
  Object.keys(obj).forEach((k) => {
    obj[k].forEach((p) => res.push({ ...p, categoryKey: k }));
  });
  return res;
}

function getById(obj, categoryKey, id) {
  return (obj[categoryKey] || []).find((p) => p.id === id) || null;
}

function removeById(obj, categoryKey, id) {
  const copy = deepClone(obj);
  copy[categoryKey] = (copy[categoryKey] || []).filter((p) => p.id !== id);
  reindex(copy[categoryKey]);
  return copy;
}

function upsert(obj, categoryKey, produto) {
  const copy = deepClone(obj);
  const list = copy[categoryKey] || [];
  const idx = list.findIndex((p) => p.id === produto.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...produto };
  } else {
    list.push({ ...produto, sortIndex: list.length });
  }
  copy[categoryKey] = list;
  reindex(copy[categoryKey]);
  return copy;
}

function moveItem(obj, categoryKey, id, delta) {
  const copy = deepClone(obj);
  const list = copy[categoryKey] || [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return copy;
  const next = idx + delta;
  if (next < 0 || next >= list.length) return copy;
  const tmp = list[idx];
  list[idx] = list[next];
  list[next] = tmp;
  reindex(list);
  copy[categoryKey] = list;
  return copy;
}

function reindex(list) {
  list.forEach((p, i) => (p.sortIndex = i));
}

// =========================
// HELPERS
// =========================
function byId(id) {
  return document.getElementById(id);
}

function makeId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function humanCategory(key) {
  switch (key) {
    case "academia":
      return "Roupas de Academia";
    case "praia":
      return "Moda Praia";
    case "lingerie":
      return "Lingerie";
    case "sexshop":
      return "Sex Shop";
    default:
      return "Catálogo";
  }
}

function placeholderImage(label, c1, c2) {
  const safe = escapeXml(label);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${c1}"/>
          <stop offset="1" stop-color="${c2}"/>
        </linearGradient>
        <radialGradient id="r" cx="30%" cy="20%" r="70%">
          <stop offset="0" stop-color="rgba(255,255,255,.65)"/>
          <stop offset="1" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="900" height="700" rx="46" fill="url(#g)"/>
      <rect width="900" height="700" rx="46" fill="url(#r)"/>
      <text x="60" y="120" font-family="Manrope, Arial" font-size="40" fill="rgba(31,26,23,.78)" font-weight="700">
        ${safe}
      </text>
      <text x="60" y="170" font-family="Manrope, Arial" font-size="22" fill="rgba(31,26,23,.62)">
        Total Encanto
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isDataUrl(url) {
  return typeof url === "string" && url.startsWith("data:");
}

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 800);
}

function cssEscape(value) {
  // Safe enough for background-image url("...") usage
  return String(value).replaceAll('"', "%22").replaceAll(")", "%29").replaceAll("(", "%28");
}

