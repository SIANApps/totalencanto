import { prisma } from "@/lib/prisma";
import ProductsTable from "./ui/products-table";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Produtos</h1>
          <p className="mt-1 text-sm text-neutral-600">Gerencie nome, preço, estoque, categoria e status.</p>
        </div>
        <a
          href="/admin/products/new"
          className="rounded-2xl bg-gradient-to-r from-roseGold-500 to-roseGold-300 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
        >
          + Novo produto
        </a>
      </div>

      <div className="mt-5">
        <ProductsTable initialProducts={products} />
      </div>
    </div>
  );
}

