import express from "express";
import {
  getMonthlyClassAttendance,
  getMonthlyMembershipGrowth,
  getMonthlyPeakHours,
  getYearlyClassAttendance,
  getYearlyMembershipGrowth,
  getYearlyPeakHours,
} from "../controllers/adminAnalytics.controller";

const router = express.Router();

router.get("/getYearlyMembershipGrowth", getYearlyMembershipGrowth);
router.get("/getMonthlyMembershipGrowth", getMonthlyMembershipGrowth);
router.get("/peak-hours/yearly", getYearlyPeakHours);
router.get("/peak-hours/monthly", getMonthlyPeakHours);
router.get("/getYearlyClassAttendance", getYearlyClassAttendance);
router.get("/getMonthlyClassAttendance", getMonthlyClassAttendance);

export default router;
