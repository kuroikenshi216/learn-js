import { logger } from "./logger";

// last line of defence for errors nothing else caught (a throw inside a timer, a promise nobody awaited...).
// after one of these the process is in an unknown state, so log it and exit instead of carrying on.
// something outside restarts it: the cluster primary, pm2, docker, systemd...
export function handleProcessErrors() {
    process.on("uncaughtException", err => {
        logger.error(`Uncaught exception: ${err.message}`, { stack: err.stack });
        // give the file logger a moment to write before exiting
        setTimeout(() => process.exit(1), 200);
    });

    // turn it into an uncaught exception so both go through the same path above
    process.on("unhandledRejection", reason => {
        throw reason;
    });
}
