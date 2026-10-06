import { QueueEvents } from "bullmq";
import type { Server } from "socket.io";
import { z } from "zod";

import type { OrderProgress } from "../jobs/order.processor";
import { logger } from "../lib/logger";
import { bullOptions } from "../lib/queues";
import { OrderRepository } from "../repositories/order.repository";

const orders = new OrderRepository();
const orderIdSchema = z.uuid();

const room = (orderId: string) => `order:${orderId}`;

export function setupOrderSocket(io: Server) {
    io.on("connection", socket => {
        logger.debug(`Socket ${socket.id} connected`);

        socket.on("order:subscribe", async (orderId: unknown) => {
            // errors in socket handlers don't reach the express error handler,
            // an uncaught one here would be an unhandled rejection, so catch everything
            try {
                const parsed = orderIdSchema.safeParse(orderId);
                if (!parsed.success) {
                    socket.emit("order:error", { message: "Invalid order id" });
                    return;
                }

                const order = await orders.findById(parsed.data);
                if (!order) {
                    socket.emit("order:error", { message: "Order not found" });
                    return;
                }

                await socket.join(room(order.id));

                // send where it's at right now, in case some updates happened before the client subscribed
                socket.emit("order:status", { orderId: order.id, status: order.status });
            } catch (err) {
                logger.error(`order:subscribe failed: ${(err as Error).message}`, { stack: (err as Error).stack });
                socket.emit("order:error", { message: "Something went wrong" });
            }
        });

        socket.on("order:unsubscribe", async (orderId: unknown) => {
            if (typeof orderId === "string") await socket.leave(room(orderId));
        });
    });

    // the worker runs in a different process, so it can't talk to the sockets directly.
    // it reports progress to Redis, and QueueEvents here listens to that
    const orderEvents = new QueueEvents("orders", bullOptions);

    orderEvents.on("progress", ({ data }) => {
        const progress = data as OrderProgress;
        io.to(room(progress.orderId)).emit("order:status", progress);
    });

    // only fires when the job has no retries left (jobId is the order id)
    orderEvents.on("failed", ({ jobId, failedReason }) => {
        io.to(room(jobId)).emit("order:status", { orderId: jobId, status: "failed", reason: failedReason });
    });

    orderEvents.on("error", err => logger.error(`QueueEvents orders: ${err.message}`));

    return () => orderEvents.close();
}
