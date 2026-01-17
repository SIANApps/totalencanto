export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Bem-vinda ao painel. Acesse <strong>Produtos</strong> para cadastrar e gerenciar seu catálogo.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-black/5 bg-white/60 p-4">
          <div className="text-xs font-semibold text-neutral-600">Atalhos</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700">
            <li>Produtos: criar, editar, ativar/inativar</li>
            <li>Categorias: manter organizado</li>
            <li>Pedidos/Clientes: módulos prontos para evoluir</li>
          </ul>
          <a
            href="/admin/products/new"
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-roseGold-500 to-roseGold-300 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
          >
            Cadastrar Produto
          </a>
        </div>
        <div className="rounded-3xl border border-black/5 bg-white/60 p-4">
          <div className="text-xs font-semibold text-neutral-600">Próximo passo</div>
          <p className="mt-2 text-sm text-neutral-700">
            Conectar o catálogo público (site vitrine) para consumir estes produtos via API.
          </p>
        </div>
      </div>
    </div>
  );
}

