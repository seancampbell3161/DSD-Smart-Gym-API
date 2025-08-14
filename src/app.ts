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
import { seed } from "./seeds/seed";
import adminAnalyticsRoutes from "./routes/adminAnalytics.routes";
// import qrcodeRoutes from "./routes/qrcodes";


dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  })
);

app.use(webhookRouter);
app.use(express.json());
connectDB();

// health route
app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/users", userRoutes);
app.use("/api/cafe-inventory", cafeInventoryRoutes);
app.use("/api/adminAnalytics", adminAnalyticsRoutes);
// app.use("/api/gyms", gymRoutes);
// app.use("/api/qrCodes", qrcodeRoutes);
// app.use("/api/checkInOut", checkinoutRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/stripe", stripeRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // Only run seed locally
  if (process.env.NODE_ENV !== "production") {
    seed();
  }
});
