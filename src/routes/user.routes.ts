import express, { Response } from "express";
import {
  createUser,
  deleteUser,
  fetchAllUsers,
  fetchUserById,
  login,
  updatePassword,
  updateUser,
  
} from "../controllers/user.controller";
import { getTrainerClasses } from "../controllers/class.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { IAuthenticatedRequest } from "../types/interface";
import { User } from "../models/user.model";

const router = express.Router();

/** Auth */
router.post("/login", login);

/** User management (admin-only for high-risk ops) */
router.post("/", requireAuth, requireRole(["admin"]), createUser);
router.get("/", requireAuth, requireRole(["admin"]), fetchAllUsers);

router.get("/profile", requireAuth, fetchUserById);
router.put("/:id", requireAuth, updateUser);
router.put("/:id/password", requireAuth, updatePassword);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteUser);

/**
 * Trainer-only helper: list classes owned by the authenticated trainer
 * (admins can also access this)
 */
router.get(
  "/trainer/mine/list",
  requireAuth,
  requireRole(["trainer", "admin"]),
  getTrainerClasses
);

/** /me — id in JWT is the email */
router.get("/me", requireAuth, async (req: IAuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { id, role, gym_id } = req.user; // id === email
  const email = id;

  try {
    const user = await User.findById(email).select("name gym_id role");
    return res.status(200).json({
      id: email,
      email,
      role,
      name: user?.name ?? null,
      gym_id: user?.gym_id ?? gym_id ?? null,
    });
  } catch {
    return res.status(200).json({
      id: email,
      email,
      role,
      name: null,
      gym_id: gym_id ?? null,
    });
  }
});

export default router;
