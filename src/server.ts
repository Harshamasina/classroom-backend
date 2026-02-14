import express from "express";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Server is running at 8000." });
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
