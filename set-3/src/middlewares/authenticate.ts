import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../utils/tokens";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        throw new AppError(401, "Unauthenticated");
    }

    try {
        req.userId = verifyAccessToken(header.slice("Bearer ".length));
    } catch {
        throw new AppError(401, "Invalid or expired token");
    }

    next();
}
