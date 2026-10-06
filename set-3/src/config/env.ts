// reads .env into process.env (built into node, no dotenv needed)
process.loadEnvFile();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
}

export const env = {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: process.env.JWT_SECRET,
    db: {
        host: process.env.DB_HOST ?? "localhost",
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? "postgres",
        password: process.env.DB_PASSWORD ?? "",
        database: process.env.DB_NAME ?? "ct_set3",
    },
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    s3: {
        endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
        region: process.env.S3_REGION ?? "us-east-1",
        accessKey: process.env.S3_ACCESS_KEY ?? "",
        secretKey: process.env.S3_SECRET_KEY ?? "",
        bucket: process.env.S3_BUCKET ?? "uploads",
    },
    githubToken: process.env.GITHUB_TOKEN ?? "",
};
