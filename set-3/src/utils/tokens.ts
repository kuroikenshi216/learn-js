import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env";

export const REFRESH_TOKEN_DAYS = 7;

export function signAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "15m" });
}

// throws if the token is invalid or expired
export function verifyAccessToken(token: string): string {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    return payload.sub as string;
}

// refresh tokens are just random strings, not JWTs - the DB is what makes them valid
export function generateRefreshToken(): string {
    return randomBytes(40).toString("hex");
}

// only the hash goes in the DB, so a leaked table can't be used to log in
export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}
