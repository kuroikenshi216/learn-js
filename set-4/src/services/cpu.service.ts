import { fibonacci } from "../cpu/fibonacci";
import { cpuPool } from "../cpu/pool";
import { AppError } from "../errors/app-error";

export class CpuService {
    // runs on the main thread: nothing else in this process can run until it's done
    blocking(n: number) {
        return fibonacci(n);
    }

    // runs in a worker thread: the main thread stays free for other requests
    async threaded(n: number): Promise<number> {
        try {
            return await cpuPool.run({ n });
        } catch (err) {
            if (err instanceof Error && err.message === "Task queue is at limit") {
                throw new AppError(503, "Server busy, try again later");
            }
            throw err;
        }
    }
}
