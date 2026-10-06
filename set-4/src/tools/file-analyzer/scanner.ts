import { EventEmitter } from "node:events";
import { lstat, opendir } from "node:fs/promises";
import path from "node:path";

export type ScannedFile = { path: string; size: number; extension: string; modified: Date };

type ScannerEvents = {
    file: [file: ScannedFile];
    directory: [dirPath: string, depth: number];
    // not called "error": emitting "error" with no listener throws and kills the scan
    skipped: [itemPath: string, reason: string];
    done: [];
};

type ScanOptions = { maxDepth?: number; ignore?: string[] };

export class DirectoryScanner extends EventEmitter<ScannerEvents> {
    private maxDepth: number;
    private ignore: Set<string>;

    constructor({ maxDepth = Infinity, ignore = [] }: ScanOptions = {}) {
        super();
        this.maxDepth = maxDepth;
        this.ignore = new Set(ignore);
    }

    async scan(root: string) {
        await this.walk(path.resolve(root), 0);
        this.emit("done");
    }

    private async walk(dir: string, depth: number) {
        this.emit("directory", dir, depth);

        let entries;
        try {
            entries = await opendir(dir);
        } catch (err) {
            // no permission etc. skip this folder, keep scanning the rest
            this.emit("skipped", dir, (err as NodeJS.ErrnoException).code ?? "unreadable");
            return;
        }

        for await (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (this.ignore.has(entry.name)) continue;

            // don't follow symlinks, a link pointing to a parent folder would loop forever
            if (entry.isSymbolicLink()) {
                this.emit("skipped", fullPath, "symlink");
            } else if (entry.isDirectory()) {
                if (depth < this.maxDepth) await this.walk(fullPath, depth + 1);
            } else if (entry.isFile()) {
                await this.scanFile(fullPath);
            }
        }
    }

    private async scanFile(filePath: string) {
        try {
            const stats = await lstat(filePath);
            this.emit("file", {
                path: filePath,
                size: stats.size,
                extension: path.extname(filePath).toLowerCase() || "(none)",
                modified: stats.mtime,
            });
        } catch (err) {
            this.emit("skipped", filePath, (err as NodeJS.ErrnoException).code ?? "unreadable");
        }
    }
}
