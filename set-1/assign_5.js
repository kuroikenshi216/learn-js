// Ref: https://javascript.info/event-loop#what-will-be-the-output-of-this-code

class FakeApi {
    #requestId = 0;

    getUser() {
        const requestId = ++this.#requestId;

        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    requestId,
                    name: "John " + requestId
                });
            }, 0);
        });
    }

    getOrders() {
        const requestId = ++this.#requestId;

        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    requestId,
                    orders: ["Order #101", "Order #102"]
                });
            }, 0);
        });
    }

    processOrder(order) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`Processed ${order}`);
            }, 0);
        });
    }
}

async function run() {
    const api = new FakeApi();

    console.log("1. run() started"); // immediate execution

    const userPromise = api.getUser(); // goes to the macrotask queue

    console.log("2. getUser() called");

    // microtask queue
    userPromise.then(user => {
        console.log("6. After userPromise then():", user.name);

        Promise.resolve().then(() => {
            console.log("8. Microtask inside first promise callback");
        });

        setTimeout(() => {
            console.log("12. Timer created inside callback (goes to macrotask queue)");
        }, 0);
    });

    const ordersPromise = api.getOrders();

    console.log("3. getOrders() called");

    setTimeout(() => {
        console.log("10. Independent timer");

        Promise.resolve().then(() => {
            console.log("11. Microtask created inside timer");
        });
    }, 0);

    console.log("4. run() synchronous work finished");

    const user = await userPromise;

    console.log("7. After userPromise await:", user.name);

    const orders = await ordersPromise;

    console.log("9. Orders received (second promise):", orders.orders);

    const result = await api.processOrder(orders.orders[0]);

    console.log("13. Order result:", result);

    console.log("14. run() finished");
}

function runAssignment5() {
    console.log("0. Program started");

    run();

    console.log("5. Program finished");
}

export default runAssignment5;