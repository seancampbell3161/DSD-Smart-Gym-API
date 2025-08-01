import express from "express";
import {
  createClass,
  fetchClasses,
  joinClass,
  leaveClass,
} from "../controllers/class.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/", requireAuth, requireRole(["trainer", "admin"]), createClass);
router.post("/:id/join", requireAuth, joinClass);
router.post("/:id/leave", requireAuth, leaveClass);

router.get("/", requireAuth, fetchClasses);

export default router;
