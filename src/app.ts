import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB";

import accessRoutes from "./routes/access.routes";
import userRoutes from "./routes/user.routes";
import classRoutes from "./routes/class.routes";
import cafeInventoryRoutes from "./routes/cafeInventory.routes";
import stripeRoutes from "./routes/stripe.routes";
import webhookRouter from "./routes/stripe.webhook";
import adminAnalyticsRoutes from "./routes/adminAnalytics.routes";

// import qrcodeRoutes from "./routes/qrcodes";
// import gymRoutes from "./routes/gym.routes";
import { seed } from "./seeds/seed";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  })
);

// Stripe webhook must come BEFORE express.json() so it can read the raw body
app.use(webhookRouter);

// Body parser (after webhook)
app.use(express.json());

// DB
connectDB();

// Health
app.get("/", (_req, res) => res.send("API is running..."));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cafe-inventory", cafeInventoryRoutes);
app.use("/api/adminAnalytics", adminAnalyticsRoutes);
// app.use("/api/gyms", gymRoutes);
// app.use("/api/qrCodes", qrcodeRoutes);
// app.use("/api/checkInOut", checkinoutRoutes);

app.use("/api/access", accessRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/stripe", stripeRoutes);

// 404 (after routes)
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // Only run seed locally
  if (process.env.NODE_ENV !== "production") {
    seed();
  }
});

export default app;
