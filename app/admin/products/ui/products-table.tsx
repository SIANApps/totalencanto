"use client";

import type { Category, Product } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type Row = Product & { category: Category | null };

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductsTable({ initialProducts }: { initialProducts: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialProducts);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((p) => {
      return (
        p.name.toLowerCase().includes(s) ||
        (p.category?.name || "").toLowerCase().includes(s) ||
        p.status.toLowerCase().includes(s)
      );
    });
  }, [rows, q]);

  async function onDelete(id: string) {
    const ok = confirm("Excluir este produto?");
    if (!ok) return;
    const t = toast.loading("Excluindo...");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produto excluído!", { id: t });
    } catch {
      toast.error("Não foi possível excluir.", { id: t });
    }
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-neutral-600">Total: {rows.length}</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, categoria ou status..."
          className="w-full max-w-md rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="text-xs text-neutral-600">
            <tr>
              <th className="py-2">Nome</th>
              <th className="py-2">Preço</th>
              <th className="py-2">Estoque</th>
              <th className="py-2">Categoria</th>
              <th className="py-2">Status</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody className="text-neutral-800">
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="py-3 font-semibold">{p.name}</td>
                <td className="py-3">{formatMoney(p.priceCents)}</td>
                <td className="py-3">{p.stock}</td>
                <td className="py-3">{p.category?.name || "—"}</td>
                <td className="py-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                      p.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-200 text-neutral-700"
                    ].join(" ")}
                  >
                    {p.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold hover:bg-black/5"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-neutral-600">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

