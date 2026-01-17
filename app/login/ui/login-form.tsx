"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password
      });

      if (!res || res.error) {
        toast.error("E-mail ou senha inválidos.");
        return;
      }

      toast.success("Bem-vinda!");
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-neutral-700">E-mail</span>
        <input
          className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none ring-0 focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@totalencanto.com"
          required
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-neutral-700">Senha</span>
        <input
          className="mt-1 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm outline-none ring-0 focus:border-roseGold-500/50 focus:shadow-[0_0_0_4px_rgba(200,162,122,0.12)]"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-roseGold-500 to-roseGold-300 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition hover:brightness-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

