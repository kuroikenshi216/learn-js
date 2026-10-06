import { Queue } from "bullmq";

import { env } from "../config/env";
import { logger } from "./logger";

// every queue, worker and QueueEvents must use the same options.
// the prefix keeps our keys (set4:emails:...) apart from other apps using the same Redis
export const bullOptions = {
    connection: { url: env.redisUrl },
    prefix: "set4",
};

export type EmailJob = { to: string; subject: string; text: string };
export type OrderJob = { orderId: string };

export const emailQueue = new Queue<EmailJob>("emails", {
    ...bullOptions,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 }, // retry after 2s, then 4s
        removeOnComplete: { age: 24 * 3600, count: 1000 },
        removeOnFail: { age: 7 * 24 * 3600 },
    },
});

export const orderQueue = new Queue<OrderJob>("orders", {
    ...bullOptions,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { age: 24 * 3600, count: 1000 },
        removeOnFail: { age: 7 * 24 * 3600 },
    },
});

// an EventEmitter "error" with no listener crashes the process
for (const queue of [emailQueue, orderQueue]) {
    queue.on("error", err => logger.error(`Queue ${queue.name}: ${err.message}`));
}

export async function closeQueues() {
    await Promise.all([emailQueue.close(), orderQueue.close()]);
}
