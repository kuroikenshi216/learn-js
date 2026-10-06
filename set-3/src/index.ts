import express from "express";

import { env } from "./config/env";
import { AppDataSource } from "./database/data-source";
import { redis } from "./lib/redis";
import { errorHandler } from "./middlewares/error-handler";
import authRoutes from "./routes/auth.routes";
import githubRoutes from "./routes/github.routes";
import productRoutes from "./routes/product.routes";

const app = express();

app.use(express.json());

// locally uploaded images, e.g. GET /uploads/products/abc.webp
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/github", githubRoutes);

app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

async function start() {
    await AppDataSource.initialize();
    await redis.connect();

    app.listen(env.port, () => {
        console.log(`Server running on http://localhost:${env.port}`);
    });
}

start().catch(err => {
    console.error("Failed to start", err);
    process.exit(1);
});
