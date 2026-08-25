import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";

/** Stripe is the only source of truth for whether money actually moved, so
 * every Payment status change happens here, off the signed webhook event —
 * never optimistically from the client that started checkout. */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const stripePaymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : undefined;
      const stripeSubscriptionId =
        typeof session.subscription === "string" ? session.subscription : undefined;

      const payment = await prisma.payment.findUnique({
        where: { stripeCheckoutSessionId: session.id },
      });
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", stripePaymentIntentId, stripeSubscriptionId },
        });
      }

      // A cart order is separate from (but may accompany) a tuition Payment
      // row above — both can share the same session id. Credit is only ever
      // spent here, on confirmed payment, never at checkout creation, so an
      // abandoned checkout never burns a family's balance.
      const cartOrder = await prisma.cartOrder.findUnique({
        where: { stripeCheckoutSessionId: session.id },
        include: { creditUses: true },
      });
      if (cartOrder && cartOrder.status !== "PAID") {
        await prisma.$transaction([
          prisma.cartOrder.update({
            where: { id: cartOrder.id },
            data: { status: "PAID", stripeSubscriptionId },
          }),
          ...cartOrder.creditUses.map((use) =>
            prisma.accountCredit.update({
              where: { id: use.accountCreditId },
              data: { remainingCents: { decrement: use.amountCents } },
            })
          ),
        ]);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
      const subscriptionId =
        typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
      if (subscriptionId) {
        await prisma.payment.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: "FAILED" },
        });
        await prisma.cartOrder.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: "FAILED" },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.payment.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "CANCELED" },
      });
      await prisma.cartOrder.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "CANCELED" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
