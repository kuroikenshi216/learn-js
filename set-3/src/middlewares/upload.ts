import multer from "multer";

import { AppError } from "../errors/app-error";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// memoryStorage keeps the file in req.file.buffer so sharp can process it before anything touches the disk
export const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(new AppError(422, "Only jpeg, png and webp images are allowed"));
        }
        cb(null, true);
    },
}).single("image");
