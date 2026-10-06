import { fibonacci } from "./fibonacci";

// runs inside a worker thread, piscina calls this with whatever pool.run() was given
export default function ({ n }: { n: number }) {
    return fibonacci(n);
}
