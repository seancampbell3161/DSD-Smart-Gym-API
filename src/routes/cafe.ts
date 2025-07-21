import app from "../app";
import { createCafeInventory } from "../controllers/cafeInventoryController";

const express = require("express");

const router = express.Router();

router.post("/cafe-inventory", createCafeInventory);

export default router;
