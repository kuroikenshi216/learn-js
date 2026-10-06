import bcrypt from "bcryptjs";

import { User } from "../entities/User";
import { AppError } from "../errors/app-error";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { UserRepository } from "../repositories/user.repository";
import { generateRefreshToken, hashToken, REFRESH_TOKEN_DAYS, signAccessToken } from "../utils/tokens";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository,
    ) {}

    async register(input: RegisterInput) {
        const existing = await this.userRepository.findByEmail(input.email);
        if (existing) {
            throw new AppError(409, "Email is already registered");
        }

        const user = await this.userRepository.create({
            name: input.name,
            email: input.email,
            password: await bcrypt.hash(input.password, 10),
        });

        return { user: this.toResponse(user), ...(await this.issueTokens(user.id)) };
    }

    async login(input: LoginInput) {
        const user = await this.userRepository.findByEmail(input.email);

        // same message for both cases so nobody can check which emails exist
        if (!user || !(await bcrypt.compare(input.password, user.password))) {
            throw new AppError(401, "Invalid email or password");
        }

        return { user: this.toResponse(user), ...(await this.issueTokens(user.id)) };
    }

    async refresh(refreshToken: string) {
        const stored = await this.refreshTokenRepository.findByHash(hashToken(refreshToken));

        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new AppError(401, "Invalid or expired refresh token");
        }

        // each refresh token works once - revoke it and hand out a new pair
        const revoked = await this.refreshTokenRepository.revoke(stored.id);
        if (!revoked) {
            throw new AppError(401, "Invalid or expired refresh token");
        }

        return this.issueTokens(stored.userId);
    }

    async logout(refreshToken: string) {
        const stored = await this.refreshTokenRepository.findByHash(hashToken(refreshToken));

        if (stored) {
            await this.refreshTokenRepository.revoke(stored.id);
        }
    }

    async me(userId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        return this.toResponse(user);
    }

    private async issueTokens(userId: string) {
        const refreshToken = generateRefreshToken();

        await this.refreshTokenRepository.create({
            userId,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
        });

        return { accessToken: signAccessToken(userId), refreshToken };
    }

    // never send the password hash back
    private toResponse(user: User) {
        return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    }
}
