import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./connectDB";
import { clerkMiddleware } from "@clerk/express";
import profileRoutes from "./routes/profiles";
import gymRoutes from "./routes/gyms";

dotenv.config();

const app = express();

app.use(express.json());
app.use(clerkMiddleware());

connectDB();

app.use("/api/profiles", profileRoutes);
app.use("/api/gyms", gymRoutes);

export default app;
