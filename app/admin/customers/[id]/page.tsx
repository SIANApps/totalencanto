import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CustomerForm from "../ui/customer-form";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) return notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-neutral-900">Editar cliente</h1>
      <p className="mt-1 text-sm text-neutral-600">Atualize nome, contato e status.</p>
      <div className="mt-5">
        <CustomerForm mode="edit" initial={customer} />
      </div>
    </div>
  );
}

