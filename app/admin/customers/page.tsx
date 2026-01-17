import { prisma } from "@/lib/prisma";
import CustomersTable from "./ui/customers-table";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-neutral-900">Clientes</h1>
      <p className="mt-1 text-sm text-neutral-600">Cadastre e gerencie seus clientes.</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-neutral-600">Dica: telefone ajuda no atendimento via WhatsApp.</div>
        <a
          href="/admin/customers/new"
          className="rounded-2xl bg-gradient-to-r from-roseGold-500 to-roseGold-300 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
        >
          + Novo cliente
        </a>
      </div>

      <div className="mt-5">
        <CustomersTable initialCustomers={customers} />
      </div>
    </div>
  );
}

