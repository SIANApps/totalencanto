# Total Encanto — Admin (Next.js 14 + Prisma + NextAuth)

Painel administrativo fullstack para gerenciamento de produtos.

## Estrutura

- `app/`: páginas (App Router) + API Routes (`app/api`)
- `lib/`: Prisma, auth e validações
- `prisma/`: schema e seed
- `env.example.txt`: exemplo de variáveis de ambiente

## Setup (PostgreSQL)

1. Configure `DATABASE_URL` (Postgres) com base em `env.example.txt`
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

## Deploy (Heroku/Koyeb/etc)

- **Não commite `.env`**. Em produção, defina `DATABASE_URL` nas variáveis de ambiente do provedor.
- Para Postgres gerenciado, geralmente é necessário `?sslmode=require` na `DATABASE_URL`.
```

## Login

As credenciais vêm do seed:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Upload de imagem (observação)

O projeto salva **URL** em `Product.imageUrl`.

- Em produção, o endpoint `POST /api/upload` está preparado para subir a imagem no **Cloudinary** quando `CLOUDINARY_URL` estiver configurado.
- Em desenvolvimento (ou sem `CLOUDINARY_URL`), ele faz fallback para salvar localmente em `public/uploads` e retorna `/uploads/...`.

