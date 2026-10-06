import { Router } from "express";

import { ProductController } from "../controllers/product.controller";
import { authenticate } from "../middlewares/authenticate";
import { uploadImage } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { ProductRepository } from "../repositories/product.repository";
import { ProductImageService } from "../services/product-image.service";
import { ProductService } from "../services/product.service";
import {
    confirmUploadSchema,
    createProductSchema,
    listProductsSchema,
    presignSchema,
    productIdSchema,
    updateProductSchema,
} from "../validators/product.validator";

const productService = new ProductService(new ProductRepository());
const productController = new ProductController(productService, new ProductImageService(productService));

const validId = validate(productIdSchema, "params");

const router = Router();

router.get("/", validate(listProductsSchema, "query"), productController.list);
router.get("/:id", validId, productController.show);

router.post("/", authenticate, validate(createProductSchema), productController.create);
router.patch("/:id", authenticate, validId, validate(updateProductSchema), productController.update);
router.delete("/:id", authenticate, validId, productController.delete);

router.post("/:id/image", authenticate, validId, uploadImage, productController.uploadImage);
router.post("/:id/image/presign", authenticate, validId, validate(presignSchema), productController.presignImage);
router.post("/:id/image/confirm", authenticate, validId, validate(confirmUploadSchema), productController.confirmImage);

export default router;
