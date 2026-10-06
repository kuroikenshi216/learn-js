import { z } from "zod";

export const sendEmailSchema = z.object({
    to: z.email(),
    subject: z.string().trim().min(1).max(200),
    text: z.string().min(1).max(10_000),
    delaySeconds: z.number().int().min(0).max(3600).default(0),
});

export const jobIdSchema = z.object({
    id: z.string().regex(/^[\w-]{1,100}$/, "Invalid job id"),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
