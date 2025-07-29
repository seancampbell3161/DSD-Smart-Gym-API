import express from "express";
import { handleCheckInOut } from "../controllers/checkinoutController";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/", requireRole("member"), handleCheckInOut);

export default router;
