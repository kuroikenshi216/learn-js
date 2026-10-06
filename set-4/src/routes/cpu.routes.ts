import { Router } from "express";

import { CpuController } from "../controllers/cpu.controller";
import { validate } from "../middlewares/validate";
import { CpuService } from "../services/cpu.service";
import { fibonacciSchema } from "../validators/cpu.validator";

const cpuController = new CpuController(new CpuService());

const router = Router();

router.get("/api/cpu/blocking", validate(fibonacciSchema, "query"), cpuController.blocking);
router.get("/api/cpu/threaded", validate(fibonacciSchema, "query"), cpuController.threaded);

export default router;
