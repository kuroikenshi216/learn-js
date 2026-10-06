import { createServer } from "node:http";
import { Server } from "socket.io";

import { app } from "./app";
import { env } from "./config/env";
import { cpuPool } from "./cpu/pool";
import { AppDataSource } from "./database/data-source";
import { logger } from "./lib/logger";
import { closeQueues } from "./lib/queues";
import { setupOrderSocket } from "./realtime/order-socket";

export async function startServer() {
    await AppDataSource.initialize();

    // socket.io needs the raw http server, not the express app
    const server = createServer(app);
    const io = new Server(server);
    const closeOrderSocket = setupOrderSocket(io);

    server.listen(env.port, () => {
        logger.info(`Server running on http://localhost:${env.port}`);
    });

    let shuttingDown = false;

    async function shutdown(signal: string) {
        if (shuttingDown) return;
        shuttingDown = true;
        logger.info(`${signal} received, shutting down`);

        setTimeout(() => process.exit(1), 10_000).unref();

        // stops accepting connections, disconnects sockets and closes the http server
        await new Promise<void>(resolve => io.close(() => resolve()));
        await closeOrderSocket();
        await closeQueues();
        await cpuPool.close();
        await AppDataSource.destroy();
        process.exit(0);
    }

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
}
