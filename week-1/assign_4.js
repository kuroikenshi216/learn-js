class OrderProcessor {
    #orders;

    constructor(orders) {
        this.#orders = orders;
    }

    #delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    async #validateOrder(order) {
        console.log(`[${order.id}] Validating order...`);

        await this.#delay(500);

        if (!order.id) {
            throw new Error("Order ID is missing");
        }

        if (!order.customer) {
            throw new Error("Customer is missing");
        }

        if (!Array.isArray(order.items) || order.items.length === 0) {
            throw new Error("Order must contain at least one item");
        }

        for (const item of order.items) {
            if (!item.name || item.price <= 0 || item.quantity <= 0) {
                throw new Error(`Invalid item in order ${order.id}`);
            }
        }

        console.log(`[${order.id}] Order validated`);

        return order;
    }

    async #calculateTotal(order) {
        console.log(`[${order.id}] Calculating total...`);

        await this.#delay(500);

        const total = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        console.log(`[${order.id}] Total: ₹${total}`);

        return {
            ...order,
            total
        };
    }

    async #processPayment(order) {
        console.log(`[${order.id}] Processing payment...`);

        await this.#delay(1000);

        const paymentSucceeded = Math.random() >= 0.3;

        if (!paymentSucceeded) {
            throw new Error("Payment failed");
        }

        const transactionId = `TXN-${Date.now()}`;

        console.log(`[${order.id}] Payment successful`);

        return {
            ...order,
            payment: {
                status: "success",
                transactionId
            }
        };
    }

    async #checkInventory(order) {
        console.log(`[${order.id}] Checking inventory...`);

        await this.#delay(700);

        const inventoryAvailable = Math.random() >= 0.2;

        if (!inventoryAvailable) {
            throw new Error("Insufficient inventory");
        }

        console.log(`[${order.id}] Inventory available`);

        return {
            ...order,
            inventory: {
                status: "available"
            }
        };
    }

    async #createShipment(order) {
        console.log(`[${order.id}] Creating shipment...`);

        await this.#delay(800);

        const trackingNumber = `Tracking-${Date.now()}`;

        console.log(`[${order.id}] Shipment created`);

        return {
            ...order,
            shipment: {
                status: "created",
                trackingNumber
            },
            status: "completed"
        };
    }

    async #processOrder(order) {
        console.log(`[${order.id}] Starting order processing`);

        try {
            let processedOrder;

            processedOrder = await this.#validateOrder(order);
            processedOrder = await this.#calculateTotal(processedOrder);
            processedOrder = await this.#processPayment(processedOrder);
            processedOrder = await this.#checkInventory(processedOrder);
            processedOrder = await this.#createShipment(processedOrder);

            console.log(`[${order.id}] Order completed`);

            return processedOrder;
        } catch (error) {
            console.log(`[${order.id}] Order processing failed: ${error.message}`);

            return {
                ...order,
                status: "failed",
                error: error.message
            };
        }
    }

    async processAllOrders() {
        const results = [];

        for (const order of this.#orders) {
            const result = await this.#processOrder(order);
            results.push(result);
        }

        return results;
    }

    displayResults(results) {
        console.log("\n===== FINAL RESULTS =====");

        for (const order of results) {
            console.log({
                id: order.id,
                customer: order.customer,
                total: order.total,
                status: order.status,
                transactionId: order.payment?.transactionId,
                trackingNumber: order.shipment?.trackingNumber,
                error: order.error
            });
        }
    }
}


async function runAssignment4() {
    const orders = [
    {
        id: "ORD-1001",
        customer: "John",
        items: [
            {
                name: "Keyboard",
                price: 2500,
                quantity: 1
            },
            {
                name: "Mouse",
                price: 1200,
                quantity: 2
            }
        ],
        paymentMethod: "card"
    },
    {
        id: "ORD-1002",
        customer: "Sarah",
        items: [
            {
                name: "Monitor",
                price: 15000,
                quantity: 1
            }
        ],
        paymentMethod: "card"
    },
    {
        id: "ORD-1003",
        customer: "Mike",
        items: [
            {
                name: "Headphones",
                price: 5000,
                quantity: 2
            }
        ],
        paymentMethod: "upi"
    },
    {
        id: "ORD-1004",
        customer: "Alice",
        items: [
            {
                name: "Laptop",
                price: 75000,
                quantity: 1
            }
        ],
        paymentMethod: "card"
    },
    {
        id: "ORD-1005",
        customer: "Bob",
        items: [
            {
                name: "Webcam",
                price: 4500,
                quantity: 1
            },
            {
                name: "Microphone",
                price: 7000,
                quantity: 1
            }
        ],
        paymentMethod: "upi"
    }
];


    const processor = new OrderProcessor(orders);

    const results = await processor.processAllOrders();

    processor.displayResults(results);
}

export default runAssignment4;