import type { Job } from "bullmq";

import { AppError } from "../errors/app-error";
import { emailQueue, type EmailJob } from "../lib/queues";
import type { SendEmailInput } from "../validators/email.validator";

export class EmailService {
    async queue({ delaySeconds, ...email }: SendEmailInput) {
        const job = await emailQueue.add("send-email", email, { delay: delaySeconds * 1000 });
        return { jobId: job.id, state: delaySeconds ? "delayed" : "waiting" };
    }

    async getJob(id: string) {
        const job = await this.findOrFail(id);
        return this.toResponse(job, await job.getState());
    }

    async listFailed() {
        const jobs = await emailQueue.getFailed(0, 49);
        return jobs.map(job => this.toResponse(job, "failed"));
    }

    async retry(id: string) {
        const job = await this.findOrFail(id);

        if ((await job.getState()) !== "failed") {
            throw new AppError(409, "Only failed jobs can be retried");
        }

        await job.retry();
        return { jobId: job.id, state: "waiting" };
    }

    private async findOrFail(id: string) {
        const job = await emailQueue.getJob(id);
        if (!job) throw new AppError(404, "Job not found");
        return job;
    }

    private toResponse(job: Job<EmailJob>, state: string) {
        return {
            id: job.id,
            state,
            to: job.data.to,
            subject: job.data.subject,
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason || null,
            createdAt: new Date(job.timestamp),
            finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
        };
    }
}
