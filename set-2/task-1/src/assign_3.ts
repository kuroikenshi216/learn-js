interface Item {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
}

type Discount =
    | { type: "percentage"; value: number }
    | { type: "flat"; value: number }
    | null;

interface CategoryRule {
    taxRate: number;
    discount: Discount;
}

type CategoryRules = Record<string, CategoryRule>;

class PaymentCalculator {
    #items: Item[];
    #categoryRules: CategoryRules = {
        electronics: {
            taxRate: 18,
            discount: {
                type: "percentage",
                value: 10
            }
        },

        furniture: {
            taxRate: 12,
            discount: {
                type: "flat",
                value: 2000
            }
        },

        stationery: {
            taxRate: 5,
            discount: null
        },

        groceries: {
            taxRate: 5,
            discount: {
                type: "percentage",
                value: 5
            }
        }
    };

    constructor(items: Item[]) {
        this.#items = items;
    }

    printBill(): void {
        const subtotal = this.#calculateSubtotal();
        const tax = this.#calculateTax();
        const discount = this.#calculateDiscount();
        const total = this.#calculateTotal(subtotal, tax, discount);

        console.log(`Subtotal = ${subtotal}`);
        console.log(`Tax = ${tax}`);
        console.log(`Discount = ${discount}`);
        console.log(`Grand total = ${total}`);
    }

    #calculateSubtotal(): number {
        return this.#items.reduce((acc, item) => {
            return acc + (item.price * item.quantity)
        }, 0);
    }

    #calculateTax(): number {
        return this.#items.reduce((acc, item) => {
            const taxRate = this.#categoryRules[item.category]?.taxRate ?? 0;
            return acc + (item.price * item.quantity * taxRate / 100);
        }, 0);
    }

    #calculateDiscount(): number {
        return this.#items.reduce((acc, item) => {
            const discount = this.#categoryRules[item.category]?.discount;

            if (discount?.type === "percentage") {
                return acc + (item.price * item.quantity * discount.value / 100);
            }

            if (discount?.type === "flat") {
                return acc + (item.quantity * discount.value);
            }

            return acc;
        }, 0);
    }

    #calculateTotal(subtotal: number, tax: number, discount: number): string {
        const total = subtotal + tax - discount;
        return total.toFixed(2);
    }
}

function runAssignment3(): void {
    const items: Item[] = [
        {
            id: "I1001",
            name: "Laptop",
            category: "electronics",
            price: 75000,
            quantity: 1
        },
        {
            id: "I1002",
            name: "Wireless Mouse",
            category: "electronics",
            price: 1800,
            quantity: 2
        },
        {
            id: "I1003",
            name: "Office Chair",
            category: "furniture",
            price: 12000,
            quantity: 1
        },
        {
            id: "I1004",
            name: "Standing Desk",
            category: "furniture",
            price: 25000,
            quantity: 1
        },
        {
            id: "I1005",
            name: "Notebook",
            category: "stationery",
            price: 250,
            quantity: 4
        },
        {
            id: "I1006",
            name: "Premium Pen",
            category: "stationery",
            price: 800,
            quantity: 2
        },
        {
            id: "I1007",
            name: "Coffee Beans",
            category: "groceries",
            price: 900,
            quantity: 3
        },
        {
            id: "I1008",
            name: "Protein Bars",
            category: "groceries",
            price: 120,
            quantity: 10
        }
    ];

    (new PaymentCalculator(items)).printBill();
}

export default runAssignment3;
