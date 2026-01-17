import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/require-api-auth";
import { CustomerUpdateSchema } from "@/lib/validators";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ customer });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CustomerUpdateSchema.safeParse({ ...body, id: params.id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const updated = await prisma.customer.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email ?? undefined,
      phone: parsed.data.phone ?? undefined,
      notes: parsed.data.notes ?? undefined,
      status: parsed.data.status
    }
  });

  return NextResponse.json({ customer: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

