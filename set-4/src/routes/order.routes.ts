import { Router } from "express";

import { OrderController } from "../controllers/order.controller";
import { validate } from "../middlewares/validate";
import { OrderRepository } from "../repositories/order.repository";
import { OrderService } from "../services/order.service";
import { createOrderSchema, orderIdSchema } from "../validators/order.validator";

const orderController = new OrderController(new OrderService(new OrderRepository()));

const router = Router();

router.get("/api/orders", orderController.list);
router.get("/api/orders/:id", validate(orderIdSchema, "params"), orderController.show);
router.post("/api/orders", validate(createOrderSchema), orderController.create);

export default router;
