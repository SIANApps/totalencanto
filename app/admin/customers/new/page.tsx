import CustomerForm from "../ui/customer-form";

export default function NewCustomerPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-neutral-900">Novo cliente</h1>
      <p className="mt-1 text-sm text-neutral-600">Cadastre um cliente para facilitar atendimento e histórico.</p>
      <div className="mt-5">
        <CustomerForm mode="create" />
      </div>
    </div>
  );
}

