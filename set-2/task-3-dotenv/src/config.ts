// Note: this is mostly AI generated - just wanted to see how env loading is done in a real project with packages

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AppEnvSchema = z.enum(["development", "staging", "production"]);
export type AppEnv = z.infer<typeof AppEnvSchema>;

const LogLevelSchema = z.enum(["debug", "info", "warn", "error"]);
type LogLevel = z.infer<typeof LogLevelSchema>;

function resolveEnvFromArgs(): string | undefined {
    const envArg = process.argv.find(arg => arg.startsWith("--env="));
    return envArg?.slice("--env=".length);
}

function resolveEnv(): AppEnv {
    const candidate =
        resolveEnvFromArgs() ?? process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";

    // .parse() throws a descriptive ZodError if candidate isn't one of the enum values
    return AppEnvSchema.parse(candidate);
}

const env = resolveEnv();

// Loads the file's keys into process.env, but (like our hand-rolled version)
// never overwrites a key that's already set on process.env for real.
dotenv.config({
    path: join(__dirname, "..", "env", `.env.${env}`),
});

const envVarsSchema = z.object({
    PORT: z.coerce.number().int().positive(),
    API_BASE_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    LOG_LEVEL: LogLevelSchema,
    FEATURE_ENABLE_NEW_CHECKOUT: z
        .string()
        .transform(value => value.trim().toLowerCase() === "true"),
});

// Fail fast at startup with one clear error if anything is missing/malformed,
// instead of the app limping along and crashing later somewhere unrelated.
const parsedEnvVars = envVarsSchema.parse(process.env);

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

export function loadConfig(): Config {
    return {
        env,
        port: parsedEnvVars.PORT,
        apiBaseUrl: parsedEnvVars.API_BASE_URL,
        databaseUrl: parsedEnvVars.DATABASE_URL,
        logLevel: parsedEnvVars.LOG_LEVEL,
        featureFlags: {
            enableNewCheckout: parsedEnvVars.FEATURE_ENABLE_NEW_CHECKOUT,
        },
    };
}
