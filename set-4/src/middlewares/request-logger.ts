import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { logger } from "../lib/logger";
import { recordRequest } from "../utils/metrics";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = performance.now();

    // one id per request, so its request log and error log can be matched up
    req.id = randomUUID();
    res.setHeader("X-Request-Id", req.id);

    res.on("finish", () => {
        const durationMs = Math.round((performance.now() - start) * 100) / 100;
        const status = res.statusCode;

        // the route pattern (/api/orders/:id), not the real url, so every order doesn't get its own row
        const route = req.route ? `${req.method} ${req.route.path}` : "unmatched";
        recordRequest(route, status, durationMs);

        const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
        logger.log(level, `${req.method} ${req.originalUrl} ${status} ${durationMs}ms`, {
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            status,
            durationMs,
        });
    });

    next();
}
