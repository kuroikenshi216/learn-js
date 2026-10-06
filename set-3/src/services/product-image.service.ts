import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import { publicFileUrl, s3 } from "../lib/s3";
import { ProductService } from "./product.service";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");
const PRESIGN_EXPIRES_SECONDS = 300;

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

export class ProductImageService {
    constructor(private productService: ProductService) {}

    async uploadLocal(productId: string, file: Express.Multer.File) {
        await this.productService.getById(productId);

        const fileName = `${productId}-${Date.now()}.webp`;
        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        try {
            await sharp(file.buffer)
                .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(path.join(UPLOAD_DIR, fileName));
        } catch {
            // the mimetype header can lie - sharp is what actually reads the bytes
            throw new AppError(422, "File is not a valid image");
        }

        return this.productService.setImageUrl(productId, `/uploads/products/${fileName}`);
    }

    async createPresignedUpload(productId: string, contentType: string) {
        await this.productService.getById(productId);

        const key = `products/${productId}/${randomUUID()}.${EXTENSIONS[contentType]}`;
        const command = new PutObjectCommand({
            Bucket: env.s3.bucket,
            Key: key,
            ContentType: contentType,
        });

        // signing content-type means the upload is rejected unless it sends this exact header
        const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: PRESIGN_EXPIRES_SECONDS,
            signableHeaders: new Set(["content-type"]),
        });

        return { uploadUrl, key, expiresIn: PRESIGN_EXPIRES_SECONDS };
    }

    async confirmUpload(productId: string, key: string) {
        // stops someone attaching a file that belongs to a different product
        if (!key.startsWith(`products/${productId}/`)) {
            throw new AppError(422, "Key does not belong to this product");
        }

        let size: number | undefined;
        try {
            const head = await s3.send(new HeadObjectCommand({ Bucket: env.s3.bucket, Key: key }));
            size = head.ContentLength;
        } catch {
            throw new AppError(422, "File not found in storage - upload it before confirming");
        }

        // a PUT with no body still creates the object, just empty
        if (!size) {
            throw new AppError(422, "Uploaded file is empty - attach a file in step 2 and upload again");
        }

        return this.productService.setImageUrl(productId, publicFileUrl(key));
    }
}
