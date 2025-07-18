import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./connectDB";
import userRoutes from "./routes/users";
import gymRoutes from "./routes/gyms";

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/gyms", gymRoutes);

export default app;
