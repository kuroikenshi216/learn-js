import type { Request, Response } from "express";

import { AppError } from "../errors/app-error";
import { ProductImageService } from "../services/product-image.service";
import { ProductService } from "../services/product.service";
import { ListProductsQuery } from "../validators/product.validator";

type IdParams = { id: string };

export class ProductController {
    constructor(
        private productService: ProductService,
        private productImageService: ProductImageService,
    ) {}

    list = async (req: Request, res: Response) => {
        const result = await this.productService.list(req.query as unknown as ListProductsQuery);
        res.json(result);
    };

    show = async (req: Request<IdParams>, res: Response) => {
        const product = await this.productService.getById(req.params.id);
        res.json({ data: product });
    };

    create = async (req: Request, res: Response) => {
        const product = await this.productService.create(req.body);
        res.status(201).json({ data: product });
    };

    update = async (req: Request<IdParams>, res: Response) => {
        const product = await this.productService.update(req.params.id, req.body);
        res.json({ data: product });
    };

    delete = async (req: Request<IdParams>, res: Response) => {
        await this.productService.delete(req.params.id);
        res.status(204).end();
    };

    uploadImage = async (req: Request<IdParams>, res: Response) => {
        if (!req.file) {
            throw new AppError(422, "Send the file in a form field called \"image\"");
        }
        const product = await this.productImageService.uploadLocal(req.params.id, req.file);
        res.json({ data: product });
    };

    presignImage = async (req: Request<IdParams>, res: Response) => {
        const result = await this.productImageService.createPresignedUpload(req.params.id, req.body.contentType);
        res.json(result);
    };

    confirmImage = async (req: Request<IdParams>, res: Response) => {
        const product = await this.productImageService.confirmUpload(req.params.id, req.body.key);
        res.json({ data: product });
    };
}
