import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { getCheckoutDetails } from "../controllers/stripe.controller";
import { requireAuth } from "../middleware/requireAuth";

dotenv.config();
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// ✅ POST route to start checkout
router.post("/create-checkout-session", requireAuth, async (req, res) => {
  const { cart } = req.body;

  const line_items = cart.map((item: CafeCartItem) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.item_name,
        images: [item.image], // optional
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantityOrdered,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/cafe?checkout=success`,
      cancel_url: `${process.env.CLIENT_URL}/cafe?checkout=cancel`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-checkout-details", requireAuth, getCheckoutDetails);

export default router;
