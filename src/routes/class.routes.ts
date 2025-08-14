// src/routes/class.routes.ts
import { Router } from "express";

// ⬇️ keep these paths the same as in your project
import { requireAuth} from "../middleware/requireAuth";
import  { requireRole } from "../middleware/requireRole";

// ⬇️ IMPORTANT: import *all* handlers you use below
import {
  createClass,
  fetchClasses,
  fetchClassesByGym,
  fetchClassesByQuery,
  fetchUserClasses,
  joinClass,
  leaveClass,
  cancelClass,
  uncancelClass,
  deleteClass,
  getTrainerClasses,
} from "../controllers/class.controller";

const router = Router();

/**
 * READ
 * - GET /classes?gym_id=123            -> fetchClasses (query)
 * - GET /classes/gym/:gymId            -> fetchClassesByGym
 * - GET /classes/userClasses           -> member’s booked classes
 * - GET /classes/trainer/mine          -> trainer’s classes (admin can filter with ?trainer_id=...)
 */
router.get("/", fetchClasses); // uses req.query.gym_id (and fallbacks) already
router.get("/query", fetchClassesByQuery); // optional alias if you still call it
router.get("/gym/:gymId", fetchClassesByGym);

// auth required for user-specific endpoints
router.get("/userClasses", requireAuth, fetchUserClasses);

// trainer/admin: list own classes; admin can pass ?trainer_id=<email>
router.get(
  "/trainer/mine",
  requireAuth,
  requireRole(["trainer", "admin"]),
  getTrainerClasses
);

/**
 * CREATE
 * - POST /classes                      -> create class (trainer = owns, admin = any)
 */
router.post("/", requireAuth, requireRole(["trainer", "admin"]), createClass);

/**
 * MEMBER ACTIONS
 * - POST /classes/:id/join
 * - POST /classes/:id/leave
 */
router.post("/:id/join", requireAuth, joinClass);
router.post("/:id/leave", requireAuth, leaveClass);

/**
 * ADMIN/TRAINER MANAGEMENT
 * - PUT /classes/:id/cancel
 * - PUT /classes/:id/uncancel
 * - DELETE /classes/:id
 */
router.put(
  "/:id/cancel",
  requireAuth,
  requireRole(["trainer", "admin"]),
  cancelClass
);

router.put(
  "/:id/uncancel",
  requireAuth,
  requireRole(["trainer", "admin"]),
  uncancelClass
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["trainer", "admin"]),
  deleteClass
);

export default router;
