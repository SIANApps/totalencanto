"use client";

import type { Customer } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function CustomersTable({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [rows, setRows] = useState<Customer[]>(initialCustomers);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((c) => {
      return (
        c.name.toLowerCase().includes(s) ||
        (c.email || "").toLowerCase().includes(s) ||
        (c.phone || "").toLowerCase().includes(s) ||
        c.status.toLowerCase().includes(s)
      );
    });
  }, [rows, q]);

  async function onDelete(id: string) {
    const ok = confirm("Excluir este cliente?");
    if (!ok) return;
    const t = toast.loading("Excluindo...");
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.filter((c) => c.id !== id));
      toast.success("Cliente excluído!", { id: t });
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
          placeholder="Buscar por nome, e-mail, telefone ou status..."
          className="w-full max-w-md rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="text-xs text-neutral-600">
            <tr>
              <th className="py-2">Nome</th>
              <th className="py-2">E-mail</th>
              <th className="py-2">Telefone</th>
              <th className="py-2">Status</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody className="text-neutral-800">
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-black/5">
                <td className="py-3 font-semibold">{c.name}</td>
                <td className="py-3">{c.email || "—"}</td>
                <td className="py-3">{c.phone || "—"}</td>
                <td className="py-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                      c.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-200 text-neutral-700"
                    ].join(" ")}
                  >
                    {c.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold hover:bg-black/5"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => onDelete(c.id)}
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
                <td colSpan={5} className="py-8 text-center text-sm text-neutral-600">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

