import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB";
import accessRoutes from "./routes/access.routes";
import userRoutes from "./routes/user.routes";
import classRoutes from "./routes/class.routes";
import { seed } from "./seeds/seed";
import cafeInventoryRoutes from "./routes/cafeInventory.routes";
import adminAnalyticsRoutes from "./routes/adminAnalytics.routes";
// import qrcodeRoutes from "./routes/qrcodes";

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
app.use("/api/cafe-inventory", cafeInventoryRoutes);
app.use("/api/adminAnalytics", adminAnalyticsRoutes);
// app.use("/api/gyms", gymRoutes);
// app.use("/api/qrCodes", qrcodeRoutes);
// app.use("/api/checkInOut", checkinoutRoutes);
app.unsubscribe("/api/access", accessRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/access", accessRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  seed();
});
