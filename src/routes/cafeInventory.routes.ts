import express from "express";
import {
  getCafeInventory,
  bulkCreateInventory,
  updateBulkInventoryItems,
  bulkDeleteInventory,
  checkoutSuccess // new merged function
} from "../controllers/cafeInventory.controller";
<<<<<<< HEAD
import { finalizeCafePurchase } from "../controllers/cafepurchase.controller";
=======
>>>>>>> 03c52fa (feat(api): standardize user id + validate cafe/stripe carts)
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

// Require authentication for all café inventory routes
router.use(requireAuth);

router.get("/", requireRole(["admin", "member"]), getCafeInventory);
router.post("/bulk", requireRole(["admin"]), bulkCreateInventory);
router.put("/bulk", requireRole(["admin"]), updateBulkInventoryItems);
router.delete("/bulk", requireRole(["admin"]), bulkDeleteInventory);

// ✅ New single endpoint for local checkout flow
router.post("/checkout-success", requireRole(["member", "admin"]), checkoutSuccess);

export default router;
