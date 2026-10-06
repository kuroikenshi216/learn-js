import path from "node:path";
import { createLogger, format, transports } from "winston";

import { env } from "../config/env";

const logDir = path.join(__dirname, "../../logs");

// files get one JSON object per line, easy to grep or ship to a log service later
const fileFormat = format.combine(format.timestamp(), format.errors({ stack: true }), format.json());

const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, pid, stack }) => {
        const line = `${timestamp} ${level} [${pid}] ${message}`;
        return stack ? `${line}\n${stack}` : line;
    }),
);

export const logger = createLogger({
    level: env.logLevel,
    defaultMeta: { pid: process.pid },
    transports: [
        new transports.Console({ format: consoleFormat }),
        new transports.File({ filename: path.join(logDir, "error.log"), level: "error", format: fileFormat }),
        new transports.File({ filename: path.join(logDir, "combined.log"), format: fileFormat }),
    ],
});
