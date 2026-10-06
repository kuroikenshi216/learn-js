import { type Job, UnrecoverableError } from "bullmq";

import { env } from "../config/env";
import { mailer } from "../lib/mailer";
import type { EmailJob } from "../lib/queues";

export async function processEmail(job: Job<EmailJob>) {
    try {
        const info = await mailer.sendMail({ from: env.smtp.from, ...job.data });
        return { messageId: info.messageId };
    } catch (err) {
        // 5xx from the mail server (bad address, rejected...) won't fix itself, so don't retry.
        // anything else (server down, timeout) is thrown as is and BullMQ retries it
        const code = (err as { responseCode?: number }).responseCode;
        if (code && code >= 500) {
            throw new UnrecoverableError(`Rejected by mail server (${code}): ${(err as Error).message}`);
        }
        throw err;
    }
}
