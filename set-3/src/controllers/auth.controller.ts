import type { Request, Response } from "express";

import { AuthService } from "../services/auth.service";

export class AuthController {
    constructor(private authService: AuthService) {}

    register = async (req: Request, res: Response) => {
        const result = await this.authService.register(req.body);
        res.status(201).json(result);
    };

    login = async (req: Request, res: Response) => {
        const result = await this.authService.login(req.body);
        res.json(result);
    };

    refresh = async (req: Request, res: Response) => {
        const result = await this.authService.refresh(req.body.refreshToken);
        res.json(result);
    };

    logout = async (req: Request, res: Response) => {
        await this.authService.logout(req.body.refreshToken);
        res.status(204).end();
    };

    me = async (req: Request, res: Response) => {
        const user = await this.authService.me(req.userId!);
        res.json({ user });
    };
}
