import { AppError } from "../errors/app-error";
import { orderQueue } from "../lib/queues";
import type { OrderRepository } from "../repositories/order.repository";
import type { CreateOrderInput } from "../validators/order.validator";

export class OrderService {
    constructor(private orders: OrderRepository) {}

    async create(input: CreateOrderInput) {
        const order = await this.orders.create(input);

        // jobId = order id, so the same order can never be queued twice
        await orderQueue.add("process-order", { orderId: order.id }, { jobId: order.id });

        return order;
    }

    list() {
        return this.orders.findLatest(20);
    }

    async getById(id: string) {
        const order = await this.orders.findById(id);
        if (!order) throw new AppError(404, "Order not found");
        return order;
    }
}
