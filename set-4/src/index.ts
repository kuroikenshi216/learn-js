import { logger } from "./lib/logger";
import { handleProcessErrors } from "./lib/process-errors";
import { startServer } from "./server";

handleProcessErrors();

startServer().catch(err => {
    logger.error(`Failed to start: ${err.message}`, { stack: err.stack });
    process.exit(1);
});
