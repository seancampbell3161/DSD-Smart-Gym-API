import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB";
import accessRoutes from "./routes/access.routes";
import userRoutes from "./routes/user.routes";
import { seed } from "./seeds/seed";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

connectDB();

app.use("/api/users", userRoutes);
app.unsubscribe("/api/access", accessRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  seed();
});
