import {
    type ApiResponse,
    type ApiPaginatedResponse,
    type PaginationMeta,
    successResponse,
    paginatedResponse,
    errorResponse,
    isSuccess,
    unwrapOrThrow,
} from "./api-response.js";

interface User {
    id: number;
    name: string;
    email: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
}

const users: User[] = [
    { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
    { id: 2, name: "Alan Turing", email: "alan@example.com" },
];

const products: Product[] = [
    { id: 1, name: "Keyboard", price: 2500 },
    { id: 2, name: "Mouse", price: 1200 },
    { id: 3, name: "Monitor", price: 15000 },
    { id: 4, name: "Webcam", price: 4500 },
    { id: 5, name: "Headphones", price: 5000 },
];

function fetchUserById(id: number): ApiResponse<User> {
    const user = users.find(u => u.id === id);

    if (!user) {
        return errorResponse(`User with id ${id} not found`, {
            statusCode: 404,
            code: "USER_NOT_FOUND",
        });
    }

    return successResponse(user);
}

function fetchProducts(page: number, pageSize: number): ApiPaginatedResponse<Product> {
    const start = (page - 1) * pageSize;
    const items = products.slice(start, start + pageSize);

    const pagination: PaginationMeta = {
        page,
        pageSize,
        totalItems: products.length,
        totalPages: Math.ceil(products.length / pageSize),
    };

    return paginatedResponse(items, pagination);
}

function printResponse<T>(label: string, response: ApiResponse<T>): void {
    console.log(`\n--- ${label} ---`);

    if (isSuccess(response)) {
        console.log(`Status: ${response.statusCode}`);
        console.log("Data:", response.data);
        return;
    }

    console.log(`Status: ${response.statusCode}`);
    console.log("Error:", response.error);
}

function printPaginatedResponse<T>(label: string, response: ApiPaginatedResponse<T>): void {
    console.log(`\n--- ${label} ---`);
    console.log(`Status: ${response.statusCode}`);
    console.log("Data:", response.data);
    console.log("Pagination:", response.pagination);
}

function main(): void {
    printResponse("Fetch existing user (success)", fetchUserById(1));
    printResponse("Fetch missing user (error)", fetchUserById(99));

    printPaginatedResponse("Fetch products page 1", fetchProducts(1, 2));
    printPaginatedResponse("Fetch products page 3", fetchProducts(3, 2));

    console.log("\n--- unwrapOrThrow (success) ---");
    const user = unwrapOrThrow(fetchUserById(1));
    console.log("Unwrapped:", user);

    console.log("\n--- unwrapOrThrow (error, throws) ---");
    try {
        unwrapOrThrow(fetchUserById(99));
    } catch (err) {
        console.log("Caught:", (err as Error).message);
    }
}

main();
