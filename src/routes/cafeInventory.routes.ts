import express from "express";
import {
  getCafeInventory,
  bulkCreateInventory,
  updateBulkInventoryItems,
  bulkDeleteInventory,
  handleCafePurchase,
} from "../controllers/cafeInventory.controller";
import { finalizeCafePurchase } from "../controllers/cafepurchase.controller"; 
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.use(requireAuth);

router.get("/", requireRole(["admin", "member"]), getCafeInventory);
router.post("/bulk", requireRole(["admin"]), bulkCreateInventory);
router.put("/bulk", requireRole(["admin"]), updateBulkInventoryItems);
router.delete("/bulk", requireRole(["admin"]), bulkDeleteInventory);
router.post("/purchase", requireRole(["member", "admin"]), handleCafePurchase);
router.post("/checkout-success", requireRole(["member", "admin"]), finalizeCafePurchase);

export default router;
