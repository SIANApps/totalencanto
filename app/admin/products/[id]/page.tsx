import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "../ui/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  if (!product) return notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-neutral-900">Editar produto</h1>
      <p className="mt-1 text-sm text-neutral-600">Atualize informações, imagem, estoque e status.</p>
      <div className="mt-5">
        <ProductForm mode="edit" categories={categories} initial={product} />
      </div>
    </div>
  );
}

