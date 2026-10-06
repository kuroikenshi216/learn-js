import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error";
import { logger } from "../lib/logger";

// express knows this is an error handler because it has 4 params
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message, errors: err.errors });
        return;
    }

    // thrown by express.json() when the body isn't valid JSON
    if (err instanceof SyntaxError) {
        res.status(400).json({ message: "Invalid JSON body" });
        return;
    }

    const error = err instanceof Error ? err : new Error(String(err));

    // pass message + stack explicitly, an Error object inside meta gets logged as {}
    logger.error(error.message, {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        stack: error.stack,
    });

    res.status(500).json({ message: "Something went wrong", requestId: req.id });
}
