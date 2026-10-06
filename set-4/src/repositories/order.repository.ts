import { AppDataSource } from "../database/data-source";
import { Order, type OrderStatus } from "../entities/Order";

export class OrderRepository {
    private get repo() {
        return AppDataSource.getRepository(Order);
    }

    findById(id: string) {
        return this.repo.findOneBy({ id });
    }

    findLatest(limit: number) {
        return this.repo.find({ order: { createdAt: "DESC" }, take: limit });
    }

    create(data: Pick<Order, "item" | "quantity" | "email">) {
        return this.repo.save(this.repo.create(data));
    }

    async updateStatus(id: string, status: OrderStatus) {
        await this.repo.update({ id }, { status });
    }
}
