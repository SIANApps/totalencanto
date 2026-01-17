# Total Encanto — Admin (Next.js 14 + Prisma + NextAuth)

Painel administrativo fullstack para gerenciamento de produtos.

## Estrutura

- `app/`: páginas (App Router) + API Routes (`app/api`)
- `lib/`: Prisma, auth e validações
- `prisma/`: schema e seed
- `env.example.txt`: exemplo de variáveis de ambiente

## Setup (SQLite)

1. Crie um arquivo `.env` baseado em `env.example.txt`
2. Instale dependências:

```bash
npm install
```

3. Rode migrations + seed:

```bash
npm run prisma:migrate
npm run db:seed
```

4. Suba o projeto:

```bash
npm run dev
```

## Login

As credenciais vêm do seed:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Upload de imagem (observação)

O exemplo salva **URL** em `Product.imageUrl`. Para upload real de arquivo, o ideal é integrar um storage (ex.: S3/Cloudinary) e salvar a URL resultante.

