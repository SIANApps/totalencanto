import { PrismaClient } from "@prisma/client";

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;

  const host = process.env.DATABASE_HOST;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const dbName = process.env.DATABASE_NAME;
  const port = process.env.DATABASE_PORT || "5432";
  const sslmode = process.env.DATABASE_SSLMODE || "require";

  if (!host || !user || !password || !dbName) return;

  // URL-encode to avoid issues with special characters in credentials
  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);
  process.env.DATABASE_URL = `postgresql://${u}:${p}@${host}:${port}/${dbName}?sslmode=${sslmode}`;
}

ensureDatabaseUrl();

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

