import type { Request, Response } from "express";

import { GithubService } from "../services/github.service";

type UsernameParams = { username: string };

export class GithubController {
    constructor(private githubService: GithubService) {}

    user = async (req: Request<UsernameParams>, res: Response) => {
        const user = await this.githubService.getUser(req.params.username);
        res.json({ data: user });
    };

    repos = async (req: Request<UsernameParams>, res: Response) => {
        const repos = await this.githubService.getRepos(req.params.username);
        res.json({ data: repos });
    };
}
