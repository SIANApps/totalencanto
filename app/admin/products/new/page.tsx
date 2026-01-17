import { prisma } from "@/lib/prisma";
import ProductForm from "../ui/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-neutral-900">Novo produto</h1>
      <p className="mt-1 text-sm text-neutral-600">Cadastre um novo item do catálogo.</p>
      <div className="mt-5">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}

