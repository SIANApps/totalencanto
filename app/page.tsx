export default function HomePage() {
  // Redireciona para a tela do cliente (vitrine)
  // Mantemos o admin em /admin (protegido por sessão)
  // Observação: redirect é a forma recomendada no App Router
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { redirect } = require("next/navigation");
  redirect("/catalogo");
}

