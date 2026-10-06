import { z } from "zod";

// capped so nobody can lock the server up for minutes with n=60
export const fibonacciSchema = z.object({
    n: z.coerce.number().int().min(1).max(40).default(30),
});
