import cluster from "node:cluster";
import os from "node:os";
import path from "node:path";

import { env } from "./config/env";
import { logger } from "./lib/logger";
import { handleProcessErrors } from "./lib/process-errors";

handleProcessErrors();

// this file only runs the primary. each worker runs index.ts (the normal server),
// and they all share port 3000: the primary hands incoming connections to them in turn
cluster.setupPrimary({ exec: path.join(__dirname, `index${path.extname(__filename)}`) });

const count = env.workers || os.availableParallelism();
logger.info(`Primary ${process.pid} forking ${count} workers`);

for (let i = 0; i < count; i++) cluster.fork();

let shuttingDown = false;

cluster.on("exit", (worker, code, signal) => {
    if (shuttingDown) return;

    logger.warn(`Worker ${worker.process.pid} died (${signal ?? code}), starting a new one`);
    // small delay so a worker that crashes on boot doesn't turn into a tight restart loop
    setTimeout(() => cluster.fork(), 1000);
});

function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("Primary shutting down workers");

    for (const worker of Object.values(cluster.workers ?? {})) {
        worker?.process.kill("SIGTERM");
    }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
