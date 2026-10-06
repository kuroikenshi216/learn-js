import { stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

import { getFileInfo } from "./file-info";
import { DirectoryScanner, type ScannedFile } from "./scanner";

const usage = `Usage:
  npm run analyze -- <path> [--depth 3] [--top 10] [--all]
  npm run analyze -- --system

  <path>     a file (shows its metadata) or a folder (scans it)
  --depth    how many folder levels to go down (default: no limit)
  --top      how many of the largest files / extensions to list (default 10)
  --all      also scan node_modules and .git (skipped by default)
  --system   show info about this machine instead`;

function formatBytes(bytes: number) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

function showSystem() {
    const cpus = os.cpus();

    console.table({
        hostname: os.hostname(),
        platform: `${os.platform()} (${os.arch()})`,
        release: os.release(),
        cpus: `${cpus.length} x ${cpus[0]?.model ?? "unknown"}`,
        memory: `${formatBytes(os.totalmem() - os.freemem())} used of ${formatBytes(os.totalmem())}`,
        loadAverage: os.loadavg().map(n => n.toFixed(2)).join(", "),
        uptime: `${(os.uptime() / 3600).toFixed(1)} hours`,
        user: os.userInfo().username,
        homedir: os.homedir(),
        tmpdir: os.tmpdir(),
        node: process.version,
    });
}

async function showFile(target: string) {
    const info = await getFileInfo(target);
    console.table({
        ...info,
        size: `${formatBytes(info.size)} (${info.size} bytes)`,
        // console.table can't print Date objects, they show up empty
        created: info.created.toLocaleString(),
        modified: info.modified.toLocaleString(),
        accessed: info.accessed.toLocaleString(),
    });
}

async function scanDirectory(target: string, depth: number, top: number, all: boolean) {
    const scanner = new DirectoryScanner({
        maxDepth: depth,
        ignore: all ? [] : ["node_modules", ".git"],
    });

    // only the biggest `top` files are kept, not every file (a home folder can have millions)
    const largest: ScannedFile[] = [];
    const byExtension = new Map<string, { count: number; size: number }>();
    let fileCount = 0;
    let totalSize = 0;
    let directories = 0;
    let skipped = 0;

    scanner.on("directory", () => directories++);

    scanner.on("file", file => {
        fileCount++;
        totalSize += file.size;

        largest.push(file);
        largest.sort((a, b) => b.size - a.size);
        if (largest.length > top) largest.pop();

        const ext = byExtension.get(file.extension) ?? { count: 0, size: 0 };
        ext.count++;
        ext.size += file.size;
        byExtension.set(file.extension, ext);

        // \r jumps back to the start of the line, so the counter updates in place
        if (process.stdout.isTTY && fileCount % 1000 === 0) process.stdout.write(`\rScanned ${fileCount} files...`);
    });

    scanner.on("skipped", (itemPath, reason) => {
        skipped++;
        if (reason !== "symlink") console.warn(`\nSkipped ${itemPath} (${reason})`);
    });

    scanner.on("done", () => {
        if (process.stdout.isTTY) process.stdout.write("\r");
    });

    const started = performance.now();
    await scanner.scan(target);
    const seconds = ((performance.now() - started) / 1000).toFixed(2);

    console.log(`\n${path.resolve(target)}\n`);
    console.table({
        files: fileCount,
        directories,
        totalSize: formatBytes(totalSize),
        skipped,
        took: `${seconds}s`,
    });

    console.log(`\nLargest ${top} files`);
    console.table(largest.map(f => ({ file: path.relative(target, f.path), size: formatBytes(f.size) })));

    console.log(`\nBy extension (top ${top} by size)`);
    console.table(
        [...byExtension]
            .sort(([, a], [, b]) => b.size - a.size)
            .slice(0, top)
            .map(([extension, { count, size }]) => ({ extension, files: count, size: formatBytes(size) })),
    );
}

async function main() {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            depth: { type: "string" },
            top: { type: "string", default: "10" },
            all: { type: "boolean", default: false },
            system: { type: "boolean", default: false },
            help: { type: "boolean", short: "h", default: false },
        },
    });

    if (values.system) return showSystem();

    const target = positionals[0];
    if (!target || values.help) {
        console.log(usage);
        return;
    }

    const depth = values.depth === undefined ? Infinity : Number(values.depth);
    const top = Number(values.top);
    if (!Number.isInteger(top) || top < 1 || (depth !== Infinity && (!Number.isInteger(depth) || depth < 0))) {
        console.error("--depth and --top must be whole numbers\n");
        console.log(usage);
        process.exitCode = 1;
        return;
    }

    const stats = await stat(target);
    if (stats.isDirectory()) {
        await scanDirectory(target, depth, top, values.all);
    } else {
        await showFile(target);
    }
}

main().catch((err: NodeJS.ErrnoException) => {
    console.error(err.code === "ENOENT" ? `No such file or folder: ${err.path}` : err.message);
    process.exitCode = 1;
});
