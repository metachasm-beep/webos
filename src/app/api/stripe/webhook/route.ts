import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook Signature Verification Failed:", err.message);
    return NextResponse.json({ error: "Invalid Signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const userEmail = session.metadata?.user_email;
        if (userEmail) {
          await supabase
            .from("profiles")
            .upsert({ email: userEmail, tier: "pro", updated_at: new Date().toISOString() });
        }
        break;
      
      case "customer.subscription.deleted":
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string);
        if ("email" in customer && customer.email) {
          await supabase
            .from("profiles")
            .upsert({ email: customer.email, tier: "free", updated_at: new Date().toISOString() });
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Processing Error:", err.message);
    return NextResponse.json({ error: "Internal Error." }, { status: 500 });
  }
}
