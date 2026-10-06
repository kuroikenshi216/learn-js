import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../errors/app-error";

type Source = "body" | "query" | "params";

export function validate(schema: z.ZodType, source: Source = "body") {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source] ?? {});

        if (!result.success) {
            const { fieldErrors, formErrors } = z.flattenError(result.error);
            const errors = formErrors.length ? { ...fieldErrors, _errors: formErrors } : fieldErrors;
            throw new AppError(422, "Validation failed", errors as Record<string, string[]>);
        }

        // in express 5 req.query is a getter, so it can't just be reassigned
        if (source === "query") {
            Object.defineProperty(req, "query", { value: result.data });
        } else {
            req[source] = result.data;
        }

        next();
    };
}
