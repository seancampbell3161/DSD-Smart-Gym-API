import { Response } from "express";
import { IAuthenticatedRequest } from "../types/interface";
import { CafePurchase } from "../models/cafepurchase.model";
import { CafeCartItem } from "../types/interface";

export const finalizeCafePurchase = async (req: IAuthenticatedRequest, res: Response) => {
  const { cart, total }: { cart: CafeCartItem[]; total: number } = req.body;
  const userId = req.user?.id;

  if (!userId || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: "Invalid purchase data" });
  }

  try {
    const newPurchase = await CafePurchase.create({
      userId,
      items: cart,
      total,
    });

    res.status(201).json({ message: "Purchase recorded", purchaseId: newPurchase._id });
  } catch (err) {
    console.error("❌ Error saving purchase:", err);
    res.status(500).json({ error: "Failed to record purchase" });
  }
};
