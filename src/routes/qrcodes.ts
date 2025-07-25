import { requireAuth } from "@clerk/express";
import express from "express";
import { createQRCode } from "../controllers/qrcodeController";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/", requireAuth(), requireRole("member"), createQRCode);

export default router;
