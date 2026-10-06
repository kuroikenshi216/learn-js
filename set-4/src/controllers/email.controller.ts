import type { Request, Response } from "express";

import type { EmailService } from "../services/email.service";

type IdParams = { id: string };

export class EmailController {
    constructor(private emailService: EmailService) {}

    send = async (req: Request, res: Response) => {
        // 202 Accepted: queued, not sent yet
        res.status(202).json({ data: await this.emailService.queue(req.body) });
    };

    show = async (req: Request<IdParams>, res: Response) => {
        res.json({ data: await this.emailService.getJob(req.params.id) });
    };

    failed = async (_req: Request, res: Response) => {
        res.json({ data: await this.emailService.listFailed() });
    };

    retry = async (req: Request<IdParams>, res: Response) => {
        res.json({ data: await this.emailService.retry(req.params.id) });
    };
}
