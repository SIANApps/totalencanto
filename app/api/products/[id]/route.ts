import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/require-api-auth";
import { ProductUpdateSchema } from "@/lib/validators";

function inferProvider(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return "local";
  if (url.includes("cloudinary.com") || url.includes("res.cloudinary.com")) return "cloudinary";
  return "remote";
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true }
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ product });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = ProductUpdateSchema.safeParse({ ...body, id: params.id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? undefined,
      priceCents: parsed.data.priceCents,
      stock: parsed.data.stock,
      status: parsed.data.status,
      categoryId: parsed.data.categoryId ?? undefined,
      imageUrl: parsed.data.imageUrl ?? undefined
    },
    include: { category: true }
  });

  if (updated.imageUrl) {
    await prisma.productImage.upsert({
      where: { productId_url: { productId: updated.id, url: updated.imageUrl } },
      create: {
        productId: updated.id,
        url: updated.imageUrl,
        provider: inferProvider(updated.imageUrl),
        publicId: null
      },
      update: {}
    });
  }

  return NextResponse.json({ product: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

