// reads .env into process.env (built into node, no dotenv needed)
process.loadEnvFile();

export const env = {
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? "development",
    logLevel: process.env.LOG_LEVEL ?? "info",
    db: {
        host: process.env.DB_HOST ?? "localhost",
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? "postgres",
        password: process.env.DB_PASSWORD ?? "",
        database: process.env.DB_NAME ?? "ct_set4",
    },
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    smtp: {
        host: process.env.SMTP_HOST ?? "localhost",
        port: Number(process.env.SMTP_PORT ?? 1025),
        from: process.env.MAIL_FROM ?? "Set 4 <no-reply@set4.local>",
    },
    workers: Number(process.env.WORKERS) || 0,
};
