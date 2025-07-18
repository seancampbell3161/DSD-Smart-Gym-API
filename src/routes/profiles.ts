import express from "express";
import { createProfile, fetchProfile } from "../controllers/profileController";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/", createProfile);
router.get("/", requireAuth(), fetchProfile);

export default router;
