import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import assignment1 from "./assign_1.js";
import assignment2 from "./assign_2.js";
import assignment3 from "./assign_3.js";

type Assignment = () => void | Promise<void>;

const assignments: Record<string, Assignment> = {
    1: assignment1,
    2: assignment2,
    3: assignment3,
};

async function main(): Promise<void> {
    const rl = readline.createInterface({ input, output });
    const answer = (await rl.question("Which assignment do you want to run? (1-3): ")).trim();
    rl.close();

    const assignment = assignments[answer];

    if (!assignment) {
        console.log(`"${answer}" is not a valid option. Choose a number from 1 to 3.`);
        return;
    }

    console.log(`\n--- Running Assignment ${answer} ---\n`);
    await assignment();
}

main();
