import { NextResponse, type NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/require-api-auth";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB (fotos de celular podem passar de 5MB)
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/jfif",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);

export async function POST(req: Request) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "FormData inválido" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  const extFromName = path.extname(file.name || "").toLowerCase().replace(".", "");
  const inferred =
    extFromName === "jpeg" || extFromName === "jpg" || extFromName === "jfif"
      ? "image/jpeg"
      : extFromName === "png"
        ? "image/png"
        : extFromName === "webp"
          ? "image/webp"
          : extFromName === "heic"
            ? "image/heic"
            : extFromName === "heif"
              ? "image/heif"
          : "";

  const mime = (file.type || inferred || "").toLowerCase();

  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      {
        error: "Formato inválido (use JPG/JPEG, PNG ou WebP)",
        receivedType: file.type || "(vazio)",
        receivedName: file.name || "(sem nome)"
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande (máx 20MB)" }, { status: 400 });
  }

  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/webp"
        ? "webp"
        : mime === "image/heic"
          ? "heic"
          : mime === "image/heif"
            ? "heif"
        : "jpg";

  const bytes = new Uint8Array(await file.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}

