import express from "express";
import {
  createQRCode,
  handleCheckInOut,
} from "../controllers/access.controller";

const router = express.Router();

router.post("/generateQRCode", requireAuth, createQRCode);
router.post("/checkInOut", requireAuth, handleCheckInOut);
