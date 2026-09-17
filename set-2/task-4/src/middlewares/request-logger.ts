import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const startedAt = process.hrtime.bigint();

    // res.statusCode isn't known yet at this point (the route handler hasn't run),
    // so we hook "finish" - fired once the response has actually been sent
    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        const timestamp = new Date().toISOString();

        console.log(
            `[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs.toFixed(1)}ms)`
        );
    });

    next();
}
