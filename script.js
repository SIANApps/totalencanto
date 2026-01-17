/**
 * Total Encanto — Catálogo (front-end simples)
 * Edite o WhatsApp e os produtos no bloco "CONFIG" e "PRODUTOS" abaixo.
 */

const STORAGE_KEY = "total-encanto:products:v1";

// =========================
// CONFIG
// =========================
// Formato: DDI + DDD + número, apenas dígitos. Ex.: 5511999999999
const WHATSAPP_PHONE = "5500000000000";

const WHATSAPP_DEFAULT_MESSAGE =
  "Olá! Vim pelo catálogo da Total Encanto e gostaria de fazer um pedido.";

// =========================
// DADOS (produtos de exemplo)
// =========================
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

// =========================
// RENDER
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const PRODUTOS = loadProducts();

  // Botão do topo
  const btnTopo = document.getElementById("btnWhatsAppTopo");
  if (btnTopo) {
    btnTopo.href = makeWhatsAppUrl(WHATSAPP_DEFAULT_MESSAGE);
  }

  // Renderiza as grids
  const grids = document.querySelectorAll(".grid[data-category]");
  grids.forEach((grid) => {
    const key = grid.getAttribute("data-category");
    const items = PRODUTOS[key] || [];
    grid.innerHTML = items.map((p) => renderCard(p, key)).join("");
  });

  // Animação ao aparecer
  setupRevealAnimation();
});

function renderCard(produto, categoriaKey) {
  const msg = `${WHATSAPP_DEFAULT_MESSAGE}\n\nProduto: ${produto.nome}\nCategoria: ${humanCategory(
    categoriaKey
  )}\n\nPode me passar valor e opções?`;

  const url = makeWhatsAppUrl(msg);

  return `
    <article class="card reveal" aria-label="${escapeHtml(produto.nome)}">
      <div class="card-inner">
        <div class="thumb">
          <img src="${produto.img}" alt="${escapeHtml(produto.nome)}" loading="lazy" />
        </div>
        <div class="meta">
          <h4 class="product-name">${escapeHtml(produto.nome)}</h4>
          <p class="product-desc">${escapeHtml(produto.desc)}</p>
          <div class="product-actions">
            <span class="tag">${escapeHtml(produto.tag || "Selecionado")}</span>
            <a class="btn-whats" href="${url}" target="_blank" rel="noreferrer">
              Pedir pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function setupRevealAnimation() {
  const cards = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    cards.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  cards.forEach((el) => obs.observe(el));
}

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return validateState(DEFAULT_PRODUTOS);
    const json = JSON.parse(raw);
    return validateState(json);
  } catch {
    return validateState(DEFAULT_PRODUTOS);
  }
}

function validateState(obj) {
  const base = { academia: [], praia: [], lingerie: [], sexshop: [] };
  const out = { ...base };
  if (!obj || typeof obj !== "object") return deepClone(DEFAULT_PRODUTOS);

  Object.keys(base).forEach((k) => {
    const arr = Array.isArray(obj[k]) ? obj[k] : [];
    out[k] = arr
      .filter((p) => p && typeof p === "object")
      .map((p) => ({
        id: String(p.id || makeId()),
        nome: String(p.nome || "").slice(0, 120),
        desc: String(p.desc || "").slice(0, 240),
        tag: String(p.tag || "Selecionado").slice(0, 40),
        img:
          String(p.img || "") ||
          placeholderImage(String(p.nome || "Produto"), "#f1e3d7", "#e7c7ad"),
        sortIndex: typeof p.sortIndex === "number" ? p.sortIndex : 0,
      }))
      .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
  });

  return out;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function makeId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// =========================
// HELPERS
// =========================
function makeWhatsAppUrl(message) {
  const phone = String(WHATSAPP_PHONE || "").replace(/\D/g, "");
  const text = encodeURIComponent(message || "");

  // Link universal (web + app)
  return `https://wa.me/${phone}?text=${text}`;
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
  // SVG pequeno (data URI) — leve, sem precisar de imagens externas
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
        ${escapeXml(label)}
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
  // Para texto dentro do SVG
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

