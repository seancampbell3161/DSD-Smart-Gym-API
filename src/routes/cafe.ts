import {
  createCafeInventory,
  getCafeInventory,
  updateCafeInventory,
  deleteCafeInventory,
} from "../controllers/cafeInventoryController";
import { requireRole } from "../middleware/requireRole";
import express from "express";

const router = express.Router();

router.get("/cafe-inventory", getCafeInventory);
router.post("/cafe-inventory", requireRole("admin"), createCafeInventory);
router.put("/cafe-inventory/:id", requireRole("admin"), updateCafeInventory);
router.delete("/cafe-inventory/:id", requireRole("admin"), deleteCafeInventory);

export default router;
