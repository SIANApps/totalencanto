"use client";

import type { Category, Product } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type Mode = "create" | "edit";

type ProductImageRow = {
  id: string;
  productId: string;
  url: string;
  provider: string | null;
  publicId: string | null;
  createdAt: string;
};

function moneyToCents(v: string) {
  const normalized = v.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".");
  const n = Number(normalized);
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function centsToMoney(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default function ProductForm({
  mode,
  categories,
  initial
}: {
  mode: Mode;
  categories: Category[];
  initial?: Product;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial ? centsToMoney(initial.priceCents) : "0,00");
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [status, setStatus] = useState<Product["status"]>(initial?.status || "ACTIVE");
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId || "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ProductImageRow[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const previewCategory = useMemo(
    () => categories.find((c) => c.id === categoryId)?.name || "—",
    [categories, categoryId]
  );

  async function refreshImages() {
    if (mode !== "edit" || !initial?.id) return;
    setLoadingImages(true);
    try {
      const res = await fetch(`/api/products/${initial.id}/images`, { credentials: "include" });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(json?.error || "Falha ao carregar galeria");
      setImages(Array.isArray(json?.images) ? json.images : []);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar galeria.");
    } finally {
      setLoadingImages(false);
    }
  }

  useEffect(() => {
    if (mode === "edit" && initial?.id) void refreshImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initial?.id]);

  async function setMainImage(url: string) {
    if (mode !== "edit" || !initial?.id) return;
    if (!url) return;
    const t = toast.loading("Definindo imagem principal...");
    try {
      const res = await fetch(`/api/products/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url })
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(json?.error || "Falha ao definir principal");
      setImageUrl(url);
      toast.success("Imagem principal atualizada!", { id: t });
    } catch (err: any) {
      toast.error(err?.message || "Erro ao definir imagem principal.", { id: t });
    }
  }

  async function onUploadFile(file: File) {
    setUploading(true);
    const t = toast.loading("Enviando imagem...");
    try {
      const fd = new FormData();
      fd.set("file", file);
      if (mode === "edit" && initial?.id) fd.set("productId", initial.id);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Falha no upload");
      setImageUrl(String(json.url || ""));
      if (mode === "edit" && initial?.id) void refreshImages();
      toast.success("Imagem enviada!", { id: t });
    } catch (err: any) {
      toast.error(err?.message || "Erro ao enviar imagem.", { id: t });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const t = toast.loading(mode === "create" ? "Salvando..." : "Atualizando...");
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        priceCents: moneyToCents(price),
        stock: Math.max(0, parseInt(stock || "0", 10) || 0),
        status,
        categoryId: categoryId || null,
        imageUrl: imageUrl.trim() || null
      };

      const url = mode === "create" ? "/api/products" : `/api/products/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({} as any));
        const firstIssue = Array.isArray(json?.issues) ? json.issues[0] : null;
        if (firstIssue?.path?.length) {
          throw new Error(`Dados inválidos: ${firstIssue.path.join(".")} (${firstIssue.message})`);
        }
        throw new Error(json?.error || "Falha");
      }

      toast.success("Salvo com sucesso!", { id: t });
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar.", { id: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-3xl border border-black/5 bg-white/60 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold text-neutral-700">Nome</span>
            <input
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-semibold text-neutral-700">Descrição</span>
            <textarea
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-700">Preço (R$)</span>
            <input
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-700">Estoque</span>
            <input
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-700">Categoria</span>
            <select
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— Sem categoria —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-700">Status</span>
            <select
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-semibold text-neutral-700">Imagem</span>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold text-neutral-600">Upload (arquivo)</span>
                <input
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif"
                  disabled={loading || uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUploadFile(f);
                    e.currentTarget.value = "";
                  }}
                />
                <p className="mt-1 text-xs text-neutral-500">JPG/PNG/WebP/HEIC • até 20MB</p>
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold text-neutral-600">Ou colar URL</span>
                <input
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={loading || uploading}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              O upload preenche a URL automaticamente (Cloudinary quando configurado; senão salva em{" "}
              <code className="rounded bg-black/5 px-1">/public/uploads</code>).
            </p>
          </label>

          {mode === "edit" ? (
            <div className="md:col-span-2">
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-neutral-700">Galeria do produto</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Clique em uma imagem para definir como <span className="font-semibold">principal</span>.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshImages()}
                  disabled={loadingImages}
                  className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-black/5 disabled:opacity-70"
                >
                  {loadingImages ? "Atualizando..." : "Atualizar galeria"}
                </button>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((img) => {
                  const isMain = !!imageUrl && img.url === imageUrl;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => void setMainImage(img.url)}
                      disabled={loading || uploading}
                      className={[
                        "group relative overflow-hidden rounded-2xl border bg-white/80 text-left",
                        isMain ? "border-roseGold-400 shadow-[0_0_0_4px_rgba(200,162,122,0.10)]" : "border-black/10"
                      ].join(" ")}
                      title={img.url}
                    >
                      <div className="aspect-[4/3] bg-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] font-semibold text-neutral-700">
                            {img.provider || "imagem"}
                          </span>
                          {isMain ? (
                            <span className="rounded-full bg-roseGold-100 px-2 py-1 text-[10px] font-semibold text-neutral-800">
                              Principal
                            </span>
                          ) : (
                            <span className="rounded-full bg-black/5 px-2 py-1 text-[10px] font-semibold text-neutral-700 opacity-0 group-hover:opacity-100">
                              Definir
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {!loadingImages && !images.length && (
                  <div className="sm:col-span-3 lg:col-span-4 rounded-2xl border border-black/10 bg-white/80 p-4 text-xs text-neutral-600">
                    Nenhuma imagem ainda. Faça um upload acima para popular a galeria.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 rounded-2xl border border-black/10 bg-white/80 p-4 text-xs text-neutral-600">
              Salve o produto primeiro para habilitar a galeria (múltiplas imagens) e escolher a imagem principal.
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            disabled={loading || uploading}
            className="rounded-2xl bg-gradient-to-r from-roseGold-500 to-roseGold-300 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)] disabled:opacity-70"
            type="submit"
          >
            {uploading ? "Enviando imagem..." : mode === "create" ? "Criar produto" : "Salvar alterações"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-black/5"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white/60 p-4">
        <div className="text-xs font-semibold text-neutral-600">Prévia</div>
        <div className="mt-3 overflow-hidden rounded-3xl border border-black/5 bg-white/80">
          <div className="aspect-[4/3] bg-neutral-100">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                Sem imagem
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="text-sm font-semibold text-neutral-900">{name || "Nome do produto"}</div>
            <div className="mt-1 text-xs text-neutral-600">{description || "Descrição do produto"}</div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-roseGold-100 px-2 py-1 text-xs font-semibold text-neutral-800">
                {previewCategory}
              </span>
              <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold text-neutral-700">
                {status === "ACTIVE" ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

