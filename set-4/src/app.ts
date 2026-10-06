import express from "express";
import path from "node:path";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { requestLogger } from "./middlewares/request-logger";
import cpuRoutes from "./routes/cpu.routes";
import debugRoutes from "./routes/debug.routes";
import emailRoutes from "./routes/email.routes";
import orderRoutes from "./routes/order.routes";
import { getMetrics } from "./utils/metrics";

export const app = express();

// first, so it times everything that comes after
app.use(requestLogger);
app.use(express.json());

// the order tracking test page: http://localhost:3000/orders.html
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", pid: process.pid });
});

app.get("/api/metrics", (_req, res) => {
    res.json(getMetrics());
});

// routes use full paths (/api/orders/:id), so the metrics can label requests by route
app.use(orderRoutes);
app.use(emailRoutes);
app.use(cpuRoutes);

if (env.nodeEnv !== "production") {
    app.use(debugRoutes);
}

app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);
