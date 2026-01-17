"use client";

import type { Customer } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Mode = "create" | "edit";

export default function CustomerForm({
  mode,
  initial
}: {
  mode: Mode;
  initial?: Customer;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [status, setStatus] = useState<Customer["status"]>(initial?.status || "ACTIVE");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const t = toast.loading(mode === "create" ? "Salvando..." : "Atualizando...");
    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        status
      };

      const url = mode === "create" ? "/api/customers" : `/api/customers/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({} as any));
        const firstIssue = Array.isArray(json?.issues) ? json.issues[0] : null;
        if (firstIssue?.path?.length) {
          throw new Error(`Dados inválidos: ${firstIssue.path.join(".")} (${firstIssue.message})`);
        }
        throw new Error(json?.error || "Falha");
      }

      toast.success("Cliente salvo!", { id: t });
      router.push("/admin/customers");
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

          <label className="block">
            <span className="text-xs font-semibold text-neutral-700">E-mail</span>
            <input
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              type="email"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-700">Telefone</span>
            <input
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-semibold text-neutral-700">Observações</span>
            <textarea
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências, tamanhos, histórico..."
            />
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
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-roseGold-500 to-roseGold-300 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)] disabled:opacity-70"
            type="submit"
          >
            {mode === "create" ? "Criar cliente" : "Salvar alterações"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/customers")}
            className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-black/5"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white/60 p-4">
        <div className="text-xs font-semibold text-neutral-600">Resumo</div>
        <div className="mt-3 rounded-3xl border border-black/5 bg-white/80 p-4">
          <div className="text-sm font-semibold text-neutral-900">{name || "Nome do cliente"}</div>
          <div className="mt-1 text-xs text-neutral-600">{email || "Sem e-mail"}</div>
          <div className="mt-1 text-xs text-neutral-600">{phone || "Sem telefone"}</div>
          <div className="mt-3">
            <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold text-neutral-700">
              {status === "ACTIVE" ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}

