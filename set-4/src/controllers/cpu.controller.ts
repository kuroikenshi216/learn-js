import type { Request, Response } from "express";

import type { CpuService } from "../services/cpu.service";

type FibQuery = { n: number };

export class CpuController {
    constructor(private cpuService: CpuService) {}

    blocking = (req: Request, res: Response) => {
        const { n } = req.query as unknown as FibQuery;
        res.json({ n, result: this.cpuService.blocking(n), pid: process.pid });
    };

    threaded = async (req: Request, res: Response) => {
        const { n } = req.query as unknown as FibQuery;
        res.json({ n, result: await this.cpuService.threaded(n), pid: process.pid });
    };
}
