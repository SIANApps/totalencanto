import LoginForm from "./ui/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-roseGold-50 via-white to-roseGold-100">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mb-6">
            <div className="text-sm font-semibold tracking-wide text-neutral-700">Total Encanto</div>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-neutral-900">Login do Admin</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Acesse o painel para gerenciar produtos, categorias e pedidos.
            </p>
          </div>
          <LoginForm />
          <p className="mt-6 text-xs text-neutral-500">
            Dica: o usuário admin é criado via seed do Prisma (veja `env.example.txt`).
          </p>
        </div>
      </div>
    </main>
  );
}

