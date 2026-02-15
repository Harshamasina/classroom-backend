import express from "express";
import cors from "cors";
import subjectsRouter from "./routes/subjects";

const app = express();
const PORT = 8000;
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}))

app.use(express.json());
app.use('/api/subjects', subjectsRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Server is running at 8000." });
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
