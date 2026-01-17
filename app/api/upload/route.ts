import { NextResponse, type NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/require-api-auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";

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

function getCloudinaryCreds() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) return null;
  try {
    const u = new URL(url);
    // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const apiKey = decodeURIComponent(u.username || "");
    const apiSecret = decodeURIComponent(u.password || "");
    const cloudName = u.hostname || "";
    if (!apiKey || !apiSecret || !cloudName) return null;
    return { apiKey, apiSecret, cloudName };
  } catch {
    return null;
  }
}

function cloudinarySignature(params: Record<string, string>, apiSecret: string) {
  // Cloudinary assina: "key1=value1&key2=value2<api_secret>" (keys ordenadas)
  const toSign = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v).length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return crypto.createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

export async function POST(req: Request) {
  const token = await requireApiAuth(req as NextRequest);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "FormData inválido" }, { status: 400 });

  const productIdRaw = form.get("productId");
  const productId = typeof productIdRaw === "string" && productIdRaw.trim() ? productIdRaw.trim() : null;
  if (productId) {
    const parsed = z.string().cuid().safeParse(productId);
    if (!parsed.success) {
      return NextResponse.json({ error: "productId inválido" }, { status: 400 });
    }
  }

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

  // 1) Preferir Cloudinary (produção) quando configurado
  const creds = getCloudinaryCreds();
  if (creds) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = (process.env.CLOUDINARY_FOLDER || "totalencanto").trim();

    const signedParams: Record<string, string> = { timestamp };
    if (folder) signedParams.folder = folder;
    const signature = cloudinarySignature(signedParams, creds.apiSecret);

    const fd = new FormData();
    fd.set("file", file);
    fd.set("api_key", creds.apiKey);
    fd.set("timestamp", timestamp);
    if (folder) fd.set("folder", folder);
    fd.set("signature", signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`;
    const res = await fetch(endpoint, { method: "POST", body: fd }).catch(() => null);
    if (!res) {
      return NextResponse.json({ error: "Falha ao conectar no Cloudinary" }, { status: 502 });
    }

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Falha no upload (Cloudinary)",
          details: json?.error?.message || json?.error || json || null
        },
        { status: 400 }
      );
    }

    const url = String(json?.secure_url || json?.url || "");
    const publicId = json?.public_id || null;

    if (productId && url) {
      // persistir a imagem e atualizar imagem principal do produto
      await prisma.productImage.upsert({
        where: { productId_url: { productId, url } },
        create: { productId, url, provider: "cloudinary", publicId: publicId ? String(publicId) : null },
        update: { publicId: publicId ? String(publicId) : undefined }
      });
      await prisma.product.update({ where: { id: productId }, data: { imageUrl: url } });
    }

    return NextResponse.json(
      {
        url,
        provider: "cloudinary",
        publicId
      },
      { status: 201 }
    );
  }

  // 2) Fallback: armazenamento local em /public/uploads (útil no dev)
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

  const url = `/uploads/${filename}`;
  if (productId) {
    await prisma.productImage.upsert({
      where: { productId_url: { productId, url } },
      create: { productId, url, provider: "local", publicId: null },
      update: {}
    });
    await prisma.product.update({ where: { id: productId }, data: { imageUrl: url } });
  }

  return NextResponse.json({ url, provider: "local" }, { status: 201 });
}

