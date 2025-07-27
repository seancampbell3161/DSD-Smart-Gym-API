import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB";
import userRoutes from "./routes/user.routes";
import gymRoutes from "./routes/gyms";
import qrcodeRoutes from "./routes/qrcodes";
import checkinoutRoutes from "./routes/checkInOut";
import { seed } from "./seeds/user.seed";

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
// app.use("/api/gyms", gymRoutes);
// app.use("/api/qrCodes", qrcodeRoutes);
// app.use("/api/checkInOut", checkinoutRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  seed();
});
