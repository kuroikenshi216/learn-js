import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import assignment1 from "./assign_1.js";
import assignment2 from "./assign_2.js";
import assignment3 from "./assign_3.js";
import assignment4 from "./assign_4.js";
import assignment5 from "./assign_5.js";

const assignments = {
    1: assignment1,
    2: assignment2,
    3: assignment3,
    4: assignment4,
    5: assignment5,
};

async function main() {
    const rl = readline.createInterface({ input, output });
    const answer = (await rl.question("Which assignment do you want to run? (1-5): ")).trim();
    rl.close();

    const assignment = assignments[answer];

    if (!assignment) {
        console.log(`"${answer}" is not a valid option. Choose a number from 1 to 5.`);
        return;
    }

    console.log(`\n--- Running Assignment ${answer} ---\n`);
    await assignment();
}

main();
