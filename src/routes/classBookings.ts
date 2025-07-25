import express from "express";
import { joinClass, leaveClass } from "../controllers/classbookingController";
import { requireAuth } from "@clerk/express";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/", requireAuth(), requireRole("member"), joinClass);
router.post("/", requireAuth(), requireRole("member"), leaveClass);

export default router;
