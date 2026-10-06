import path from "node:path";
import { Piscina } from "piscina";

// .ts when running through tsx, .js after `npm run build`
const ext = path.extname(__filename);

export const cpuPool = new Piscina({
    filename: path.join(__dirname, `fibonacci.worker${ext}`),
    minThreads: 1,
    maxThreads: 4,
    // when every thread is busy, at most 16 tasks wait in line, the rest are rejected
    maxQueue: 16,
});
