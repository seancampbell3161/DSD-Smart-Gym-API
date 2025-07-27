import express from "express";
import { createUser } from "../controllers/user.controller";

const router = express.Router();

router.post("/", createUser);
// router.get('/', fetchUsers)
// router.get('/:id', fetchUserById)
// router.put('/:id', updateUser)
// router.put('/:id/password', updatePassword)
// router.delete('/:id', deleteUser)
// router.post('/login', login)

export default router;
