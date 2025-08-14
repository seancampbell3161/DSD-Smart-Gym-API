import express from "express";
import {
  createClass,
  fetchClasses,
  fetchUserClasses,
  joinClass,
  leaveClass,
  fetchClassesByGym,
  cancelClass,
  uncancelClass,
  deleteClass,
} from "../controllers/class.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

// Create class (trainer/admin)
router.post("/", requireAuth, requireRole(["trainer", "admin"]), createClass);

router.get("/", requireAuth, fetchClasses);
router.get("/gym/:gymId", requireAuth, fetchClassesByGym);
router.get("/userClasses", requireAuth, fetchUserClasses);


router.post("/:id/join", requireAuth, requireRole(["member"]), joinClass);
router.post("/:id/leave", requireAuth, requireRole(["member"]), leaveClass);


// Manage status (trainer/admin)
router.put("/:id/cancel", requireAuth, requireRole(["trainer", "admin"]), cancelClass);
router.put("/:id/uncancel", requireAuth, requireRole(["trainer", "admin"]), uncancelClass);

// Delete class (trainer/admin)
router.delete("/:id", requireAuth, requireRole(["trainer", "admin"]), deleteClass);

// Fetch variants
router.get("/", requireAuth, fetchClasses);            // /api/classes?gym_id=...
router.get("/gym/:gymId", requireAuth, fetchClasses);  // /api/classes/gym/:gymId
router.get("/:id", requireAuth, fetchClasses);         // legacy

export default router;
