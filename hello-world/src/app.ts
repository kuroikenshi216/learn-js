import express from "express"

const app = express();

app.get('/', (req, res) => {
    res.send("Vanakam vaiyagam");
});

app.listen(3000);