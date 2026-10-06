import { Router } from "express";

import { EmailController } from "../controllers/email.controller";
import { validate } from "../middlewares/validate";
import { EmailService } from "../services/email.service";
import { jobIdSchema, sendEmailSchema } from "../validators/email.validator";

const emailController = new EmailController(new EmailService());

const validId = validate(jobIdSchema, "params");

const router = Router();

router.post("/api/emails", validate(sendEmailSchema), emailController.send);
// before /:id, otherwise "failed" would be treated as an id
router.get("/api/emails/failed", emailController.failed);
router.get("/api/emails/:id", validId, emailController.show);
router.post("/api/emails/:id/retry", validId, emailController.retry);

export default router;
