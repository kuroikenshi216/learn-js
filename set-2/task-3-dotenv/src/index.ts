import { loadConfig } from "./config.js";

function main(): void {
    const config = loadConfig();

    console.log(`Loaded config for "${config.env}" environment:\n`);
    console.log(config);
}

main();
