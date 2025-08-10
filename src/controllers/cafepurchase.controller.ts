// src/controllers/cafepurchase.controller.ts
import { Response } from "express";
import { IAuthenticatedRequest, CafeCartItem } from "../types/interface";
import { CafePurchase } from "../models/cafepurchase.model";

// Helper to throw 400s for bad input
const bad = (msg: string) => {
  const e: any = new Error(msg);
  e.status = 400;
  return e;
};

type SavedItem = { name: string; qty: number; price: number };


export const finalizeCafePurchase = async (
  req: IAuthenticatedRequest,
  res: Response
) => {
  const body = (req.body ?? {}) as { cart: CafeCartItem[]; total?: number };
  const cart = Array.isArray(body.cart) ? body.cart : [];
  const userId = req.user?.id;

  if (!userId || cart.length === 0) {
    return res.status(400).json({ error: "Invalid purchase data" });
  }

  try {
    // Normalize + validate items
    const items: SavedItem[] = cart.map((item, idx) => {
      const name = item.item_name;
      const qty = Number(item.quantityOrdered);
      const price = Number(item.price);

      if (!name) throw bad(`Missing item_name at index ${idx}`);
      if (!Number.isFinite(qty) || qty <= 0)
        throw bad(`Invalid quantity at index ${idx}`);
      if (!Number.isFinite(price) || price <= 0)
        throw bad(`Invalid price at index ${idx}`);

      return { name, qty, price };
    });

    // Compute total in cents to avoid float drift
    const totalCents = items.reduce(
      (sum, it) => sum + it.qty * Math.round(it.price * 100),
      0
    );
    const total = totalCents / 100;

    // Optional: sanity-check client-provided total
    if (
      typeof body.total === "number" &&
      Math.abs(body.total - total) > 0.01
    ) {
      return res.status(400).json({
        error: "Total mismatch",
        clientTotal: body.total,
        serverTotal: total,
      });
    }

    const newPurchase = await CafePurchase.create({
      userId,
      items,
      total,
    });

    return res
      .status(201)
      .json({ message: "Purchase recorded", purchaseId: newPurchase._id });
  } catch (err: any) {
    const status = Number.isInteger(err?.status) ? err.status : 500;
    console.error("❌ Error saving purchase:", err);
    return res
      .status(status)
      .json({ error: err?.message || "Failed to record purchase" });
  }
};

export const getCheckoutDetails = async (
  req: IAuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const lastPurchase = await CafePurchase.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastPurchase) {
      return res.status(404).json({ error: "No recent purchase found." });
    }

    return res.status(200).json({
      items: lastPurchase.items, // [{ name, qty, price }]
      total: lastPurchase.total,
      createdAt: lastPurchase.createdAt,
    });
  } catch (err) {
    console.error("❌ Receipt fetch failed:", err);
    return res.status(500).json({ error: "Failed to retrieve receipt" });
  }
};
