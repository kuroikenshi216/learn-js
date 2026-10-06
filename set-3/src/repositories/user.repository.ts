import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";

export class UserRepository {
    private get repo() {
        return AppDataSource.getRepository(User);
    }

    findById(id: string) {
        return this.repo.findOneBy({ id });
    }

    findByEmail(email: string) {
        return this.repo.findOneBy({ email });
    }

    create(data: { name: string; email: string; password: string }) {
        return this.repo.save(this.repo.create(data));
    }
}
