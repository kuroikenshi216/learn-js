import express from "express";
import rateLimit from "express-rate-limit";

import { requestLogger } from "./middlewares/request-logger.js";

const app = express();
const port = 3000;

app.use(requestLogger);
app.use(rateLimit({ windowMs: 10_000, limit: 5 }));

app.get("/", (req, res) => {
    res.json({ message: "Vanakam da mapla, Express la irrunthu!" });
});

app.get("/slow", async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    res.json({ message: "Slow boii" });
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
