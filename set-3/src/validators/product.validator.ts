import { z } from "zod";

const productFields = {
    name: z.string().trim().min(1, "Name is required").max(255),
    description: z.string().max(2000).optional(),
    category: z.string().trim().min(1, "Category is required").max(100),
    price: z.number().min(0).max(99_999_999),
};

export const createProductSchema = z.object({
    ...productFields,
    stock: z.number().int().min(0).default(0),
});

// built from the fields without defaults - otherwise a PATCH without "stock" would reset it to 0
export const updateProductSchema = z
    .object({ ...productFields, stock: z.number().int().min(0) })
    .partial()
    .refine(data => Object.keys(data).length > 0, "Send at least one field to update");

export const listProductsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(["createdAt", "price", "name"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
});

export const productIdSchema = z.object({
    id: z.uuid("Invalid product id"),
});

export const presignSchema = z.object({
    contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export const confirmUploadSchema = z.object({
    key: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsSchema>;
