import type { Request, Response } from "express";

import type { OrderService } from "../services/order.service";

type IdParams = { id: string };

export class OrderController {
    constructor(private orderService: OrderService) {}

    list = async (_req: Request, res: Response) => {
        res.json({ data: await this.orderService.list() });
    };

    show = async (req: Request<IdParams>, res: Response) => {
        res.json({ data: await this.orderService.getById(req.params.id) });
    };

    create = async (req: Request, res: Response) => {
        const order = await this.orderService.create(req.body);
        res.status(201).json({ data: order });
    };
}
