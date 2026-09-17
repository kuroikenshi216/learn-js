interface Transaction {
    id: number;
    fromId: number;
    toId: number;
    amount: number;
    description: string;
    createdAt: string;
    updatedAt: string;
}

function trainingTask1(): void {
    // random data from a project
    const transactions: Transaction[] = [
        {
            id: 272827,
            fromId: 12077,
            toId: 7902,
            amount: 4.83,
            description: "Rights Issue Discount",
            createdAt: "2025-07-03 05:19:51",
            updatedAt: "2025-07-03 05:19:51",
        },
        {
            id: 290752,
            fromId: 5,
            toId: 16834,
            amount: 5182.52,
            description: "Bought 223 shares",
            createdAt: "2025-08-15 12:31:06",
            updatedAt: "2025-08-15 12:31:06",
        },
        {
            id: 116999,
            fromId: 11292,
            toId: 11291,
            amount: 66.09,
            description: "Buy order placed for 3 shares",
            createdAt: "2024-05-24 22:23:06",
            updatedAt: "2024-05-24 22:23:06",
        },
        {
            id: 81521,
            fromId: 5,
            toId: 8884,
            amount: 223.0,
            description: "Bought 10 shares",
            createdAt: "2023-11-01 12:30:26",
            updatedAt: "2023-11-01 12:30:26",
        },
        {
            id: 395020,
            fromId: 8821,
            toId: 1964,
            amount: 182.21,
            description: "Distribution Payout",
            createdAt: "2026-05-06 17:46:56",
            updatedAt: "2026-05-06 17:46:56",
        },
        {
            id: 210481,
            fromId: 17074,
            toId: 17073,
            amount: 32981.85,
            description: "Buy order placed for 1485 shares",
            createdAt: "2025-02-28 22:31:36",
            updatedAt: "2025-02-28 22:31:36",
        },
        {
            id: 335675,
            fromId: 5,
            toId: 19318,
            amount: 1580.32,
            description: "Bought 68 Vuka Imara units",
            createdAt: "2025-10-27 12:51:58",
            updatedAt: "2025-10-27 12:51:58",
        },
        {
            id: 246650,
            fromId: 15181,
            toId: 132,
            amount: 300.0,
            description: "Manual Payment",
            createdAt: "2025-05-05 20:48:29",
            updatedAt: "2025-05-05 20:48:29",
        },
        {
            id: 161261,
            fromId: 7952,
            toId: 7951,
            amount: 444.2,
            description: "Buy order placed for 20 shares",
            createdAt: "2024-09-03 23:27:09",
            updatedAt: "2024-09-03 23:27:09",
        },
        {
            id: 336117,
            fromId: 25047,
            toId: 25046,
            amount: 11271.4,
            description: "Buy order placed for 485 unit(s) of imara",
            createdAt: "2025-10-28 00:52:30",
            updatedAt: "2025-10-28 00:52:30",
        },
        {
            id: 67370,
            fromId: 6941,
            toId: 6940,
            amount: 223.0,
            description: "Buy order placed for 10 shares",
            createdAt: "2023-08-23 18:53:58",
            updatedAt: "2023-08-23 18:53:58",
        },
        {
            id: 57853,
            fromId: 1936,
            toId: 1,
            amount: 1066.0,
            description: "Mpesa C2B",
            createdAt: "2023-05-22 22:25:54",
            updatedAt: "2023-05-22 22:25:54",
        },
        {
            id: 315767,
            fromId: 12813,
            toId: 1964,
            amount: 266.51,
            description: "Dividend to User",
            createdAt: "2025-09-29 15:35:50",
            updatedAt: "2025-09-29 15:35:50",
        },
        {
            id: 307117,
            fromId: 5,
            toId: 15542,
            amount: 92.96,
            description: "Bought 4 Vuka Imara units",
            createdAt: "2025-09-29 12:43:42",
            updatedAt: "2025-09-29 12:43:42",
        },
        {
            id: 61553,
            fromId: 964,
            toId: 1,
            amount: 22500.0,
            description: "Mpesa C2B",
            createdAt: "2023-06-23 03:00:22",
            updatedAt: "2023-06-23 03:00:22",
        },
        {
            id: 111352,
            fromId: 11679,
            toId: 132,
            amount: 299.0,
            description: "Manual Payment",
            createdAt: "2024-05-02 16:54:31",
            updatedAt: "2024-05-02 16:54:31",
        },
        {
            id: 234057,
            fromId: 1964,
            toId: 6002,
            amount: 2.09,
            description: "Withholding Tax for Dividends",
            createdAt: "2025-04-30 14:32:06",
            updatedAt: "2025-05-01 22:32:08",
        },
        {
            id: 162559,
            fromId: 12129,
            toId: 12130,
            amount: 577.46,
            description: "Order with id '49173' and transaction id '161445' has been cancelled",
            createdAt: "2024-09-05 22:11:54",
            updatedAt: "2024-09-05 22:11:54",
        },
        {
            id: 389941,
            fromId: 25024,
            toId: 1,
            amount: 2975.0,
            description: "Mpesa C2B",
            createdAt: "2026-04-27 10:27:04",
            updatedAt: "2026-04-27 10:27:04",
        },
        {
            id: 302505,
            fromId: 5,
            toId: 23273,
            amount: 1998.64,
            description: "Bought 86 Vuka Imara units",
            createdAt: "2025-09-15 13:31:36",
            updatedAt: "2025-09-15 13:31:36",
        },
        {
            id: 149480,
            fromId: 6610,
            toId: 1964,
            amount: 3.0,
            description: "Dividend to User",
            createdAt: "2024-09-03 22:27:30",
            updatedAt: "2024-09-03 22:27:30",
        },
        {
            id: 95493,
            fromId: 10324,
            toId: 10323,
            amount: 7599.15,
            description: "Buy order placed for 351 shares",
            createdAt: "2024-02-14 19:37:08",
            updatedAt: "2024-02-14 19:37:08",
        },
        {
            id: 312707,
            fromId: 8515,
            toId: 1964,
            amount: 312.33,
            description: "Dividend to User",
            createdAt: "2025-09-29 15:34:02",
            updatedAt: "2025-09-29 15:34:02",
        },
        {
            id: 178458,
            fromId: 5,
            toId: 9378,
            amount: 4997.25,
            description: "Bought 225 shares",
            createdAt: "2024-11-01 12:30:48",
            updatedAt: "2024-11-01 12:30:48",
        },
        {
            id: 212303,
            fromId: 4799,
            toId: 4798,
            amount: 88.84,
            description: "Buy order placed for 4 shares",
            createdAt: "2025-03-03 16:56:13",
            updatedAt: "2025-03-03 16:56:13",
        },
    ];

    console.log("Sum = " + getSum(transactions));
    console.log("Average = " + getAverage(transactions));
    console.log("Top 10");
    console.log(getTopN(transactions, 10));
}

function getSum(transactions: Transaction[]): number {
    return transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
    );
}

function getAverage(transactions: Transaction[]): number {
    const n = transactions.length;
    if (n === 0) {
        return 0;
    }

    const sum = getSum(transactions);

    return sum / n;
}

function getTopN(transactions: Transaction[], n: number): Transaction[] {
    return [...transactions] // creates a copy of transactions to avoid modifying original
        .sort((a, b) => b.amount - a.amount)
        .slice(0, n);
}

export default trainingTask1;
