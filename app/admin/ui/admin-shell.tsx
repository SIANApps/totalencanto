"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/products/new", label: "Cadastrar Produto" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/customers", label: "Clientes" }
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    // mantém Produtos ativo em /admin/products/* (inclui new e [id])
    if (href === "/admin/products") return pathname.startsWith("/admin/products");
    return pathname === href;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-roseGold-50 via-white to-roseGold-100">
      <div className="mx-auto flex max-w-7xl gap-4 px-3 py-4 md:px-6 md:py-6">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-black/5 bg-white/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:block">
          <div className="mb-4">
            <div className="text-sm font-semibold tracking-wide text-neutral-700">Total Encanto</div>
            <div className="mt-1 font-serif text-xl font-semibold text-neutral-900">Admin</div>
          </div>

          <nav className="space-y-1">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "block rounded-2xl px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-roseGold-100 text-neutral-900"
                      : "text-neutral-700 hover:bg-black/5"
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-6 w-full rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-black/5"
          >
            Sair
          </button>
        </aside>

        <div className="flex-1">
          <header className="mb-4 rounded-3xl border border-black/5 bg-white/70 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
            <div className="flex items-center justify-between">
              <div className="font-serif text-lg font-semibold">Total Encanto</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold"
                >
                  Menu
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold"
                >
                  Sair
                </button>
              </div>
            </div>

            {open && (
              <nav className="mt-3 grid gap-1">
                {nav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "rounded-2xl px-3 py-2 text-sm font-semibold",
                        active ? "bg-roseGold-100 text-neutral-900" : "text-neutral-700 hover:bg-black/5"
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </header>

          <main className="rounded-3xl border border-black/5 bg-white/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

