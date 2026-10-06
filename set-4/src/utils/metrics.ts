import os from "node:os";

type RouteStats = { count: number; errors: number; totalMs: number; maxMs: number };

const routes = new Map<string, RouteStats>();
const statusCounts: Record<string, number> = {};
const recentDurations: number[] = [];
const MAX_RECENT = 1000;
let totalRequests = 0;

// a timer that should fire every 500ms. if it fires late, something was blocking the event loop that long
const LAG_INTERVAL_MS = 500;
let lastLagMs = 0;
let maxLagMs = 0;
let expectedAt = performance.now() + LAG_INTERVAL_MS;

setInterval(() => {
    const now = performance.now();
    lastLagMs = Math.max(0, now - expectedAt);
    maxLagMs = Math.max(maxLagMs, lastLagMs);
    expectedAt = now + LAG_INTERVAL_MS;
}, LAG_INTERVAL_MS).unref(); // unref: this timer alone shouldn't keep the process alive

export function recordRequest(route: string, status: number, durationMs: number) {
    totalRequests++;

    const statusClass = `${Math.floor(status / 100)}xx`;
    statusCounts[statusClass] = (statusCounts[statusClass] ?? 0) + 1;

    const stats = routes.get(route) ?? { count: 0, errors: 0, totalMs: 0, maxMs: 0 };
    stats.count++;
    stats.totalMs += durationMs;
    stats.maxMs = Math.max(stats.maxMs, durationMs);
    if (status >= 500) stats.errors++;
    routes.set(route, stats);

    recentDurations.push(durationMs);
    if (recentDurations.length > MAX_RECENT) recentDurations.shift();
}

function percentile(values: number[], p: number) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

const round = (n: number) => Math.round(n * 100) / 100;
const toMb = (bytes: number) => round(bytes / 1024 / 1024);

export function getMetrics() {
    const memory = process.memoryUsage();

    return {
        pid: process.pid,
        uptimeSeconds: Math.round(process.uptime()),
        requests: {
            total: totalRequests,
            byStatus: statusCounts,
            latencyMs: {
                p50: round(percentile(recentDurations, 50)),
                p95: round(percentile(recentDurations, 95)),
                p99: round(percentile(recentDurations, 99)),
            },
        },
        routes: Object.fromEntries(
            [...routes].map(([route, s]) => [
                route,
                { count: s.count, errors: s.errors, avgMs: round(s.totalMs / s.count), maxMs: round(s.maxMs) },
            ]),
        ),
        memoryMb: { rss: toMb(memory.rss), heapUsed: toMb(memory.heapUsed), heapTotal: toMb(memory.heapTotal) },
        eventLoop: {
            lagMs: round(lastLagMs),
            maxLagMs: round(maxLagMs),
            // share of time the loop was busy since the process started (0 = idle, 1 = always busy)
            utilization: round(performance.eventLoopUtilization().utilization),
        },
        loadAverage: os.loadavg().map(round),
    };
}
