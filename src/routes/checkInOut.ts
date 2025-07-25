import express from "express";
import { handleCheckInOut } from "../controllers/checkinoutController";
import { requireRole } from "../middleware/requireRole";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/", requireAuth(), requireRole("member"), handleCheckInOut);

export default router;
