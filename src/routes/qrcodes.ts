import express from "express";
import { createQRCode } from "../controllers/access.controller";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/", requireRole("member"), createQRCode);

export default router;
