import { env } from "../config/env";
import { AppError } from "../errors/app-error";

const BASE_URL = "https://api.github.com";
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// all the talking-to-github details live here, so the service only deals with clean data or an AppError
export class GithubClient {
    async get<T>(path: string): Promise<T> {
        for (let attempt = 0; ; attempt++) {
            const canRetry = attempt < MAX_RETRIES;
            let res: Response;

            try {
                res = await fetch(BASE_URL + path, {
                    headers: this.headers(),
                    signal: AbortSignal.timeout(TIMEOUT_MS),
                });
            } catch (err) {
                // network failure or timeout
                if (canRetry) {
                    await sleep(this.backoff(attempt));
                    continue;
                }
                console.error("GitHub request failed:", err);
                throw new AppError(502, "Could not reach GitHub");
            }

            if (res.ok) {
                return (await res.json()) as T;
            }

            // 5xx is github's problem and often temporary - worth another go. 4xx won't change on retry
            if (res.status >= 500 && canRetry) {
                await sleep(this.backoff(attempt));
                continue;
            }

            throw this.toAppError(res);
        }
    }

    private toAppError(res: Response) {
        if (res.status === 404) {
            return new AppError(404, "Not found on GitHub");
        }

        const remaining = res.headers.get("x-ratelimit-remaining");
        const retryAfter = res.headers.get("retry-after");

        if ((res.status === 403 || res.status === 429) && (remaining === "0" || retryAfter)) {
            const resetAt = retryAfter
                ? new Date(Date.now() + Number(retryAfter) * 1000)
                : new Date(Number(res.headers.get("x-ratelimit-reset")) * 1000);

            return new AppError(503, `GitHub rate limit hit, try again after ${resetAt.toISOString()}`);
        }

        if (res.status === 401) {
            console.error("GitHub rejected the token - check GITHUB_TOKEN in .env");
        }

        return new AppError(502, `GitHub request failed with status ${res.status}`);
    }

    private headers() {
        const headers: Record<string, string> = {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "ct-set-3",
        };

        if (env.githubToken) {
            headers.Authorization = `Bearer ${env.githubToken}`;
        }

        return headers;
    }

    // 500ms, 1000ms, 2000ms...
    private backoff(attempt: number) {
        return 500 * 2 ** attempt;
    }
}
