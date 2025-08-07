import express from "express";
import {
  getMonthlyClassAttendance,
  getMonthlyMembershipGrowth,
  getMonthlyPeakHours,
  getYearlyClassAttendance,
  getYearlyMembershipGrowth,
  getYearlyPeakHours,
} from "../controllers/adminAnalytics.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.get(
  "/getYearlyMembershipGrowth",
  requireAuth,
  requireRole(["admin"]),
  getYearlyMembershipGrowth
);
router.get(
  "/getMonthlyMembershipGrowth",
  requireAuth,
  requireRole(["admin"]),
  getMonthlyMembershipGrowth
);
router.get(
  "/peak-hours/yearly",
  requireAuth,
  requireRole(["admin"]),
  getYearlyPeakHours
);
router.get(
  "/peak-hours/monthly",
  requireAuth,
  requireRole(["admin"]),
  getMonthlyPeakHours
);
router.get(
  "/getYearlyClassAttendance",
  requireAuth,
  requireRole(["admin"]),
  getYearlyClassAttendance
);
router.get(
  "/getMonthlyClassAttendance",
  requireAuth,
  requireRole(["admin"]),
  getMonthlyClassAttendance
);

export default router;
