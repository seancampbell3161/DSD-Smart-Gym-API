import { requireAuth } from "@clerk/express";
import {
  createCafeInventory,
  getCafeInventory,
  updateCafeInventory,
  deleteCafeInventory,
} from "../controllers/cafeInventoryController";
import { requireRole } from "../middleware/requireRole";
import express from "express";

const router = express.Router();

router.get(
  "/cafe-inventory",
  requireAuth(),
  requireRole("member"),
  getCafeInventory
);
router.post(
  "/cafe-inventory",
  requireAuth(),
  requireRole("admin"),
  createCafeInventory
);
router.put(
  "/cafe-inventory/:id",
  requireAuth(),
  requireRole("admin"),
  updateCafeInventory
);
router.delete(
  "/cafe-inventory/:id",
  requireAuth(),
  requireRole("admin"),
  deleteCafeInventory
);

export default router;
