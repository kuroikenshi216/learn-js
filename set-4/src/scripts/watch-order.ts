import { io } from "socket.io-client";

// npm run watch:order -- <order id>
const orderId = process.argv[2];
if (!orderId) {
    console.error("Usage: npm run watch:order -- <order id>");
    process.exit(1);
}

const socket = io(process.env.API_URL ?? "http://localhost:3000", { transports: ["websocket"] });

socket.on("connect", () => {
    console.log(`connected, watching ${orderId}`);
    socket.emit("order:subscribe", orderId);
});

socket.on("order:status", ({ status }: { status: string }) => {
    console.log(`${new Date().toLocaleTimeString()}  ${status}`);
    if (status === "delivered" || status === "failed") socket.close();
});

socket.on("order:error", ({ message }: { message: string }) => {
    console.error(message);
    socket.close();
});

socket.on("connect_error", err => {
    console.error(`Could not connect: ${err.message}`);
    socket.close();
});
