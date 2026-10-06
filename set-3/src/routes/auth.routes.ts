import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import { loginSchema, refreshTokenSchema, registerSchema } from "../validators/auth.validator";

const authService = new AuthService(new UserRepository(), new RefreshTokenRepository());
const authController = new AuthController(authService);

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);
router.post("/logout", validate(refreshTokenSchema), authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
