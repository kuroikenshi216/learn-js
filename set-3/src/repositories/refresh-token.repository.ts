import { IsNull } from "typeorm";

import { AppDataSource } from "../database/data-source";
import { RefreshToken } from "../entities/RefreshToken";

export class RefreshTokenRepository {
    private get repo() {
        return AppDataSource.getRepository(RefreshToken);
    }

    create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
        return this.repo.save(this.repo.create(data));
    }

    findByHash(tokenHash: string) {
        return this.repo.findOneBy({ tokenHash });
    }

    // returns false if it was already revoked
    async revoke(id: string) {
        const result = await this.repo.update({ id, revokedAt: IsNull() }, { revokedAt: new Date() });
        return result.affected === 1;
    }
}
