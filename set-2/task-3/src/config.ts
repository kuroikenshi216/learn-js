import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { parseEnvFile } from "./env-parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type AppEnv = "development" | "staging" | "production";

const VALID_ENVS: readonly AppEnv[] = ["development", "staging", "production"];

const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

export interface Config {
    env: AppEnv;
    port: number;
    apiBaseUrl: string;
    databaseUrl: string;
    logLevel: LogLevel;
    featureFlags: {
        enableNewCheckout: boolean;
    };
}

function isAppEnv(value: string): value is AppEnv {
    return (VALID_ENVS as readonly string[]).includes(value);
}

function resolveEnvFromArgs(): string | undefined {
    const envArg = process.argv.find(arg => arg.startsWith("--env="));
    return envArg?.slice("--env=".length);
}

function resolveEnv(): AppEnv {
    const candidate =
        resolveEnvFromArgs() ?? process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";

    if (!isAppEnv(candidate)) {
        throw new Error(
            `Invalid environment "${candidate}". Expected one of: ${VALID_ENVS.join(", ")}`
        );
    }

    return candidate;
}

function requireVar(vars: Record<string, string>, key: string): string {
    const value = vars[key];

    if (value === undefined || value === "") {
        throw new Error(`Missing required config value: ${key}`);
    }

    return value;
}

function parsePort(value: string): number {
    const port = Number(value);

    if (!Number.isInteger(port) || port <= 0) {
        throw new Error(`Invalid PORT value: "${value}"`);
    }

    return port;
}

function parseLogLevel(value: string): LogLevel {
    if (!(LOG_LEVELS as readonly string[]).includes(value)) {
        throw new Error(`Invalid LOG_LEVEL "${value}". Expected one of: ${LOG_LEVELS.join(", ")}`);
    }

    return value as LogLevel;
}

function parseBooleanFlag(value: string): boolean {
    return value.trim().toLowerCase() === "true";
}

export function loadConfig(): Config {
    const env = resolveEnv();
    const envFilePath = join(__dirname, "..", "env", `.env.${env}`);
    const fileVars = parseEnvFile(envFilePath);

    const vars: Record<string, string> = { ...fileVars };
    for (const key of Object.keys(fileVars)) {
        vars[key] = process.env[key] ?? fileVars[key] ?? "";
    }

    return {
        env,
        port: parsePort(requireVar(vars, "PORT")),
        apiBaseUrl: requireVar(vars, "API_BASE_URL"),
        databaseUrl: requireVar(vars, "DATABASE_URL"),
        logLevel: parseLogLevel(requireVar(vars, "LOG_LEVEL")),
        featureFlags: {
            enableNewCheckout: parseBooleanFlag(requireVar(vars, "FEATURE_ENABLE_NEW_CHECKOUT")),
        },
    };
}
