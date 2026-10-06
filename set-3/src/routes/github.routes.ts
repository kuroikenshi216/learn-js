import { Router } from "express";

import { GithubClient } from "../clients/github.client";
import { GithubController } from "../controllers/github.controller";
import { validate } from "../middlewares/validate";
import { GithubService } from "../services/github.service";
import { usernameSchema } from "../validators/github.validator";

const githubController = new GithubController(new GithubService(new GithubClient()));

const router = Router();

router.get("/users/:username", validate(usernameSchema, "params"), githubController.user);
router.get("/users/:username/repos", validate(usernameSchema, "params"), githubController.repos);

export default router;
