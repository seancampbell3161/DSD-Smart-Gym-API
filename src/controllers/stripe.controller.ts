import { Response } from "express";
import { IAuthenticatedRequest } from "../types/interface";
import { CafePurchase } from "../models/cafepurchase.model";

export const getCheckoutDetails = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.user;

    const lastPurchase = await CafePurchase.findOne({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastPurchase) {
      return res.status(404).json({ error: "No recent purchase found." });
    }

    res.status(200).json({
      items: lastPurchase.items,
      total: lastPurchase.total,
    });
  } catch (err) {
    console.error("❌ Receipt fetch failed:", err);
    res.status(500).json({ error: "Failed to retrieve receipt" });
  }
};
