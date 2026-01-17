import { z } from "zod";

export const ProductStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export const CustomerStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

const ImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (v) => {
      // aceita URL completa (https://...) OU arquivo salvo localmente em /uploads/...
      if (v.startsWith("/uploads/")) return true;
      try {
        // eslint-disable-next-line no-new
        new URL(v);
        return true;
      } catch {
        return false;
      }
    },
    { message: "URL da imagem inválida" }
  );

export const ProductCreateSchema = z.object({
  name: z.coerce.string().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
  // coerce permite receber "123" como string (muito comum em forms) e converter para number
  priceCents: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0),
  status: ProductStatusSchema.default("ACTIVE"),
  categoryId: z.string().cuid().optional().nullable(),
  imageUrl: ImageUrlSchema.optional().nullable()
});

export const ProductUpdateSchema = ProductCreateSchema.partial().extend({
  id: z.string().cuid()
});

export const CustomerCreateSchema = z.object({
  name: z.coerce.string().min(2).max(120),
  email: z.coerce.string().trim().email().optional().nullable(),
  phone: z.coerce.string().trim().max(40).optional().nullable(),
  notes: z.coerce.string().trim().max(2000).optional().nullable(),
  status: CustomerStatusSchema.default("ACTIVE")
});

export const CustomerUpdateSchema = CustomerCreateSchema.partial().extend({
  id: z.string().cuid()
});
