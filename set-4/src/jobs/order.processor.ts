import { type Job, UnrecoverableError } from "bullmq";
import { setTimeout as sleep } from "node:timers/promises";

import { ORDER_STEPS, type OrderStatus } from "../entities/Order";
import { emailQueue, type OrderJob } from "../lib/queues";
import { OrderRepository } from "../repositories/order.repository";

const STEP_DELAY_MS = 2000;

const orders = new OrderRepository();

export type OrderProgress = { orderId: string; status: OrderStatus };

export async function processOrder(job: Job<OrderJob>) {
    const order = await orders.findById(job.data.orderId);
    if (!order) throw new UnrecoverableError(`Order ${job.data.orderId} not found`);

    // on a retry, carry on from the last step that finished instead of starting over
    const done = ORDER_STEPS.indexOf(order.status as (typeof ORDER_STEPS)[number]);

    for (const status of ORDER_STEPS.slice(done + 1)) {
        await sleep(STEP_DELAY_MS); // pretend to do the real work (charge card, call warehouse...)
        await orders.updateStatus(order.id, status);

        // picked up by QueueEvents in the API process and pushed to the browser over socket.io
        await job.updateProgress({ orderId: order.id, status } satisfies OrderProgress);
    }

    // fixed jobId so a retried order job doesn't queue the email twice
    await emailQueue.add(
        "send-email",
        {
            to: order.email,
            subject: `Your order has been delivered`,
            text: `Hi! Your order of ${order.quantity} x ${order.item} has been delivered.`,
        },
        { jobId: `order-${order.id}-delivered` },
    );
}
