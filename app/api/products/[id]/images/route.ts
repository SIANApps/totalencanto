import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/require-api-auth";
import { z } from "zod";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsedId = z.string().cuid().safeParse(params.id);
  if (!parsedId.success) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const images = await prisma.productImage.findMany({
    where: { productId: params.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ images });
}

const CreateSchema = z.object({
  url: z.string().trim().min(1),
  provider: z.string().trim().optional().nullable(),
  publicId: z.string().trim().optional().nullable()
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsedId = z.string().cuid().safeParse(params.id);
  if (!parsedId.success) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await prisma.productImage.upsert({
    where: { productId_url: { productId: params.id, url: parsed.data.url } },
    create: {
      productId: params.id,
      url: parsed.data.url,
      provider: parsed.data.provider ?? null,
      publicId: parsed.data.publicId ?? null
    },
    update: {
      provider: parsed.data.provider ?? undefined,
      publicId: parsed.data.publicId ?? undefined
    }
  });

  // opcional: manter a última imagem como principal
  await prisma.product.update({ where: { id: params.id }, data: { imageUrl: parsed.data.url } });

  return NextResponse.json({ image: created }, { status: 201 });
}

