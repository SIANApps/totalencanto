import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/require-api-auth";
import { ProductCreateSchema } from "@/lib/validators";

function inferProvider(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return "local";
  if (url.includes("cloudinary.com") || url.includes("res.cloudinary.com")) return "cloudinary";
  return "remote";
}

export async function GET(req: Request) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = ProductCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await prisma.product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      priceCents: parsed.data.priceCents,
      stock: parsed.data.stock,
      status: parsed.data.status,
      categoryId: parsed.data.categoryId ?? null,
      imageUrl: parsed.data.imageUrl ?? null
    },
    include: { category: true }
  });

  if (created.imageUrl) {
    await prisma.productImage.upsert({
      where: { productId_url: { productId: created.id, url: created.imageUrl } },
      create: {
        productId: created.id,
        url: created.imageUrl,
        provider: inferProvider(created.imageUrl),
        publicId: null
      },
      update: {}
    });
  }

  return NextResponse.json({ product: created }, { status: 201 });
}

