import { readFileSync } from "node:fs";

export function parseEnvFile(filePath: string): Record<string, string> {
    const contents = readFileSync(filePath, "utf-8");
    const result: Record<string, string> = {};

    for (const rawLine of contents.split("\n")) {
        const line = rawLine.trim();

        if (line === "" || line.startsWith("#")) {
            continue;
        }

        const separatorIndex = line.indexOf("=");

        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        const isQuoted =
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"));

        if (isQuoted) {
            value = value.slice(1, -1);
        }

        result[key] = value;
    }

    return result;
}
