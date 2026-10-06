import { Router } from "express";

// only mounted outside production, for seeing the error handling work
const router = Router();

// caught by the express error handler → 500 + error log, server keeps running
router.get("/api/debug/error", () => {
    throw new Error("Boom (sync)");
});

router.get("/api/debug/async-error", async () => {
    await Promise.resolve();
    throw new Error("Boom (async)");
});

// thrown outside any request (in a timer), so express can't catch it.
// handleProcessErrors logs it and the process exits
router.get("/api/debug/crash", (_req, res) => {
    res.json({ message: `Process ${process.pid} will crash in 100ms` });
    setTimeout(() => {
        throw new Error("Boom (uncaught)");
    }, 100);
});

// a promise that rejects with nobody awaiting it, same ending as /crash
router.get("/api/debug/rejection", (_req, res) => {
    res.json({ message: `Process ${process.pid} will crash in 100ms` });
    setTimeout(() => {
        void Promise.reject(new Error("Boom (unhandled rejection)"));
    }, 100);
});

export default router;
