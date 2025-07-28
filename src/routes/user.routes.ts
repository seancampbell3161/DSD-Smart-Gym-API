import express from "express";
import {
  createUser,
  deleteUser,
  fetchAllUsers,
  fetchUserById,
  login,
  updatePassword,
  updateUser,
} from "../controllers/user.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = express.Router();

router.post("/", requireAuth, requireRole(["admin"]), createUser);
router.post("/login", login);

router.get("/", requireAuth, requireRole(["admin"]), fetchAllUsers);
router.get("/profile", requireAuth, fetchUserById);

router.put("/", requireAuth, updateUser);
router.put("/password", requireAuth, updatePassword);

router.delete("/", requireAuth, deleteUser);

export default router;
