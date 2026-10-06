import { type Job, Worker } from "bullmq";

import { AppDataSource } from "./database/data-source";
import { processEmail } from "./jobs/email.processor";
import { processOrder } from "./jobs/order.processor";
import { logger } from "./lib/logger";
import { handleProcessErrors } from "./lib/process-errors";
import { bullOptions, closeQueues, type EmailJob, type OrderJob } from "./lib/queues";
import { OrderRepository } from "./repositories/order.repository";

handleProcessErrors();

const orders = new OrderRepository();

// true when there are no attempts left (or the job threw an UnrecoverableError)
function isFinalFailure(job: Job, err: Error) {
    return err.name === "UnrecoverableError" || job.attemptsMade >= (job.opts.attempts ?? 1);
}

async function start() {
    await AppDataSource.initialize();

    const emailWorker = new Worker<EmailJob>("emails", processEmail, { ...bullOptions, concurrency: 5 });
    const orderWorker = new Worker<OrderJob>("orders", processOrder, { ...bullOptions, concurrency: 5 });

    emailWorker.on("completed", job => {
        logger.info(`Email job ${job.id} sent to ${job.data.to}`);
    });

    emailWorker.on("failed", (job, err) => {
        if (!job) return;

        if (isFinalFailure(job, err)) {
            logger.error(`Email job ${job.id} failed for good after ${job.attemptsMade} attempt(s): ${err.message}`, {
                jobId: job.id,
                to: job.data.to,
            });
        } else {
            logger.warn(`Email job ${job.id} attempt ${job.attemptsMade} failed, will retry: ${err.message}`);
        }
    });

    orderWorker.on("completed", job => {
        logger.info(`Order ${job.data.orderId} delivered`);
    });

    orderWorker.on("failed", async (job, err) => {
        if (!job) return;

        if (!isFinalFailure(job, err)) {
            logger.warn(`Order ${job.data.orderId} attempt ${job.attemptsMade} failed, will retry: ${err.message}`);
            return;
        }

        logger.error(`Order ${job.data.orderId} failed: ${err.message}`, { stack: err.stack });
        try {
            await orders.updateStatus(job.data.orderId, "failed");
        } catch (dbErr) {
            logger.error(`Could not mark order ${job.data.orderId} as failed: ${(dbErr as Error).message}`);
        }
    });

    for (const worker of [emailWorker, orderWorker]) {
        worker.on("error", err => logger.error(`Worker ${worker.name}: ${err.message}`));
    }

    logger.info("Worker started, waiting for jobs");

    let shuttingDown = false;

    async function shutdown(signal: string) {
        if (shuttingDown) return;
        shuttingDown = true;
        logger.info(`${signal} received, finishing active jobs`);

        // if a job hangs, don't wait forever
        setTimeout(() => process.exit(1), 30_000).unref();

        // close() waits for running jobs to finish and stops picking up new ones
        await Promise.all([emailWorker.close(), orderWorker.close()]);
        await closeQueues();
        await AppDataSource.destroy();
        process.exit(0);
    }

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch(err => {
    logger.error(`Worker failed to start: ${err.message}`, { stack: err.stack });
    process.exit(1);
});
