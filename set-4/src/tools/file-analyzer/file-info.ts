import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

// 0o755 → "rwxr-xr-x"
function permissions(mode: number) {
    const chars = "rwxrwxrwx";
    let result = "";
    for (let i = 0; i < 9; i++) {
        result += mode & (1 << (8 - i)) ? chars[i] : "-";
    }
    return result;
}

// streams the file through the hash in chunks, so a 4GB file doesn't need 4GB of memory
async function sha256(filePath: string) {
    const hash = createHash("sha256");
    await pipeline(createReadStream(filePath), hash);
    return hash.digest("hex");
}

export async function getFileInfo(filePath: string) {
    const absolute = path.resolve(filePath);
    const stats = await stat(absolute);

    return {
        name: path.basename(absolute),
        directory: path.dirname(absolute),
        extension: path.extname(absolute) || null,
        type: stats.isDirectory() ? "directory" : stats.isFile() ? "file" : "other",
        size: stats.size,
        permissions: permissions(stats.mode),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        sha256: stats.isFile() ? await sha256(absolute) : null,
    };
}
