import express from "express";
import { createClass, fetchClasses } from "../controllers/classesController";
import { requireAuth } from "@clerk/express";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/", createClass);
router.get("/", requireAuth(), requireRole("member"), fetchClasses);

export default router;
