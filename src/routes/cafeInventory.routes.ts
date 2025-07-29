import express from "express";
import {
  getCafeInventory,
  bulkCreateInventory,
  updateBulkInventoryItems,
  bulkDeleteInventory,
} from "../controllers/cafeInventoryController";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.use(requireAuth);

router.get("/", requireRole(["admin", "member"]), getCafeInventory);
router.post("/bulk", requireRole(["admin"]), bulkCreateInventory);
router.put("/bulk", requireRole(["admin"]), updateBulkInventoryItems);
router.delete("/bulk", requireRole(["admin"]), bulkDeleteInventory);

// router.get("/", getCafeInventory);
// router.post("/bulk", bulkCreateInventory);
// router.put("/bulk", updateBulkInventoryItems);
// router.delete("/bulk", bulkDeleteInventory);

export default router;
