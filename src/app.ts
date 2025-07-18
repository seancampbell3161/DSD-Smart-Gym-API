import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB";
import { clerkMiddleware } from "@clerk/express";
import profileRoutes from "./routes/profiles";
import gymRoutes from "./routes/gyms";
import qrcodeRoutes from "./routes/qrcodes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

connectDB();

app.use("/api/profiles", profileRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/qrCodes", qrcodeRoutes);

export default app;
