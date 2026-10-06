import { z } from "zod";

export const createOrderSchema = z.object({
    item: z.string().trim().min(1).max(255),
    quantity: z.number().int().min(1).max(100),
    email: z.email().toLowerCase(),
});

export const orderIdSchema = z.object({
    id: z.uuid(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
