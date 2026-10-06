import { createClient } from "redis";

import { env } from "../config/env";

export const redis = createClient({ url: env.redisUrl });

// without a listener, a dropped connection crashes the whole process
redis.on("error", err => console.error("Redis error:", err.message));
