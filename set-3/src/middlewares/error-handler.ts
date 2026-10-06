import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

import { AppError } from "../errors/app-error";

// express knows this is an error handler because it has 4 params
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message, errors: err.errors });
        return;
    }

    // thrown by express.json() when the body isn't valid JSON
    if (err instanceof SyntaxError) {
        res.status(400).json({ message: "Invalid JSON body" });
        return;
    }

    // file too big, unexpected field name, etc.
    if (err instanceof MulterError) {
        res.status(422).json({ message: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
}
