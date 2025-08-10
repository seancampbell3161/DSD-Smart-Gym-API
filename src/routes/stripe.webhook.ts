// src/routes/stripe.webhook.ts
import { Router } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";

const router = Router();

// Use your account's default API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Small tagged logger to keep console readable
const log = (msg: string, ...args: any[]) => console.log(`[STRIPE] ${msg}`, ...args);

router.post(
  "/stripe/webhook",
  // IMPORTANT: raw body required for signature verification
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"] as string | undefined;
    if (!sig) return res.status(400).send("Missing Stripe-Signature header");

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body, // raw Buffer (do NOT JSON.parse)
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      log("❌ Webhook verification failed: %s", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Respond fast to stop Stripe retries; do work after this
    res.status(200).json({ received: true });

    // Handle the events you care about
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        log("✅ checkout.session.completed %s", session.id);
        // TODO: fulfill order (e.g., decrement inventory, mark paid, send email, etc.)
        break;
      }
      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        log("💸 charge.succeeded %s", charge.id);
        break;
      }
      default: {
        // Leave visible so your lead sees activity
        log("ℹ️ Unhandled event: %s", event.type);
        break;
      }
    }
  }
);

export default router;
