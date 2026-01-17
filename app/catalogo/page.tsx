import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function waLink(phone: string, text: string) {
  const digits = (phone || "").replace(/\D/g, "");
  const q = encodeURIComponent(text);
  return `https://wa.me/${digits}?text=${q}`;
}

export default async function CatalogoPage() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5500000000000";

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { createdAt: "desc" }]
  });

  const grouped = new Map<string, typeof products>();
  for (const p of products) {
    const key = p.category?.name || "Sem categoria";
    const arr = grouped.get(key) || [];
    arr.push(p);
    grouped.set(key, arr);
  }

  const categories = Array.from(grouped.keys());

  return (
    <main className="min-h-screen bg-gradient-to-br from-roseGold-50 via-white to-roseGold-100">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="font-serif text-xl font-semibold text-neutral-900">Total Encanto</div>
            <div className="text-xs text-neutral-600">Catálogo</div>
          </div>
          <nav className="hidden gap-2 md:flex">
            {categories.map((c) => (
              <a
                key={c}
                href={`#${encodeURIComponent(c)}`}
                className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-black/5"
              >
                {c}
              </a>
            ))}
          </nav>
          <Link
            href="/login"
            className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-black/5"
          >
            Área do Admin
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-semibold text-neutral-700">
              Desperte seu encanto
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-neutral-900 md:text-5xl">
              Desperte seu encanto.
              <br />
              <span className="bg-gradient-to-r from-roseGold-600 to-roseGold-300 bg-clip-text text-transparent">
                Vista sua confiança.
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-700">
              Produtos selecionados para realçar sua beleza com elegância. Escolha e peça direto no WhatsApp.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={waLink(phone, "Olá! Vim pelo catálogo da Total Encanto e gostaria de fazer um pedido.")}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-gradient-to-r from-roseGold-500 to-roseGold-300 px-5 py-3 text-sm font-semibold text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
              >
                Pedir pelo WhatsApp
              </a>
              <a
                href={categories.length ? `#${encodeURIComponent(categories[0])}` : "#produtos"}
                className="rounded-2xl border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-black/5"
              >
                Ver produtos
              </a>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Dica: configure o WhatsApp em <code className="rounded bg-black/5 px-1">NEXT_PUBLIC_WHATSAPP_PHONE</code>.
            </p>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/60 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="text-xs font-semibold text-neutral-600">Categorias</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {categories.map((c) => (
                <a
                  key={c}
                  href={`#${encodeURIComponent(c)}`}
                  className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-black/5"
                >
                  {c}
                  <div className="mt-1 text-xs text-neutral-500">{grouped.get(c)?.length || 0} itens</div>
                </a>
              ))}
              {!categories.length && (
                <div className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-neutral-700">
                  Nenhum produto ativo ainda. Cadastre no Admin.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="produtos" className="mx-auto max-w-7xl px-4 pb-14">
        {categories.map((c) => {
          const list = grouped.get(c) || [];
          return (
            <div key={c} id={encodeURIComponent(c)} className="scroll-mt-24 py-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h2 className="font-serif text-2xl font-semibold text-neutral-900">{c}</h2>
                <span className="text-xs font-semibold text-neutral-600">{list.length} produtos</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => {
                  const msg =
                    `Olá! Vim pelo catálogo da Total Encanto e gostaria de fazer um pedido.\n\n` +
                    `Produto: ${p.name}\n` +
                    `Preço: ${formatMoney(p.priceCents)}\n` +
                    `Categoria: ${c}\n\n` +
                    `Pode me passar opções e disponibilidade?`;

                  return (
                    <article
                      key={p.id}
                      className="overflow-hidden rounded-3xl border border-black/5 bg-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
                    >
                      <div className="relative aspect-[4/3] bg-neutral-100">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                            Sem imagem
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-neutral-900">{p.name}</h3>
                          <span className="shrink-0 rounded-full bg-roseGold-100 px-2 py-1 text-xs font-semibold text-neutral-800">
                            {formatMoney(p.priceCents)}
                          </span>
                        </div>
                        {p.description && (
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-600">
                            {p.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <span className="text-xs text-neutral-500">Estoque: {p.stock}</span>
                          <a
                            href={waLink(phone, msg)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl bg-gradient-to-r from-roseGold-500 to-roseGold-300 px-4 py-2 text-xs font-semibold text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
                          >
                            Pedir no WhatsApp
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <footer className="border-t border-black/5 bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-neutral-700">
          <p>© Total Encanto – Beleza, atitude e poder feminino.</p>
          <a href="#produtos" className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-semibold">
            Voltar ao topo
          </a>
        </div>
      </footer>
    </main>
  );
}

