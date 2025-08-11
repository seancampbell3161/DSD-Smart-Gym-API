// src/routes/stripe.routes.ts
import express, { Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { requireAuth } from "../middleware/requireAuth";
import { getCheckoutDetails } from "../controllers/cafepurchase.controller";
import { IAuthenticatedRequest } from "../types/interface";

dotenv.config();
const router = express.Router();

type CafeCartItem = {
  item_name: string;
  image?: string;
  price: number;
  quantityOrdered: number;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

function validateCheckoutCartOrThrow(cart: unknown): CafeCartItem[] {
  if (!Array.isArray(cart) || cart.length === 0) {
    const e: any = new Error(
      "Invalid cart format. Cart must be a non-empty array of valid items."
    );
    e.status = 400;
    throw e;
  }

  cart.forEach((item: any, idx: number) => {
    if (
      !item ||
      typeof item.item_name !== "string" ||
      typeof item.price !== "number" ||
      typeof item.quantityOrdered !== "number" ||
      item.price <= 0 ||
      item.quantityOrdered <= 0 ||
      (item.image !== undefined && typeof item.image !== "string")
    ) {
      const e: any = new Error(`Invalid cart item at index ${idx}`);
      e.status = 400;
      throw e;
    }
  });

  return cart as CafeCartItem[];
}

router.post(
  "/create-checkout-session",
  requireAuth,
  async (req: IAuthenticatedRequest, res: Response) => {
    try {
      const { cart, success_url, cancel_url } = req.body ?? {};
      const validCart = validateCheckoutCartOrThrow(cart);

      const userId = req.user!.id; 
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
        validCart.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.item_name,
              ...(item.image ? { images: [item.image] } : {}),
            },
            unit_amount: Math.round(item.price * 100), // cents
          },
          quantity: item.quantityOrdered,
        }));

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        success_url:
          success_url ??
          `${process.env.CLIENT_URL}/cafe?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url ?? `${process.env.CLIENT_URL}/cafe?checkout=cancel`,
        metadata: {
          userId, 
        },
      });

      return res.status(200).json({ id: session.id, url: session.url });
    } catch (err: any) {
      const status = Number.isInteger(err?.status) ? err.status : 500;
      console.error("❌ Stripe error:", err?.message || err);
      return res
        .status(status)
        .json({ error: err?.message || "Failed to create Checkout Session" });
    }
  }
);

router.get("/get-checkout-details", requireAuth, getCheckoutDetails);

export default router;
