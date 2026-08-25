import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";
import { ensureStripeCustomer } from "@/lib/stripe/customer";
import { errorResponse } from "@/lib/api/errors";

const APPLICATION_FEE_CENTS = Number(process.env.STRIPE_APPLICATION_FEE_CENTS ?? 15000);

/** Creates a Stripe Checkout Session for either the one-time application fee
 * or a monthly tuition subscription, and records a PENDING Payment row that
 * the webhook flips to PAID once Stripe confirms it (Section 2 pattern —
 * Postgres status is the source of truth, Stripe is the payment processor). */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { type, submissionId, returnTo } = (await req.json()) as {
      type: "APPLICATION_FEE" | "TUITION";
      submissionId?: string;
      returnTo?: string;
    };
    const origin = new URL(req.url).origin;
    // Only ever redirect back into this app — never trust an absolute/external URL here.
    const backTo = returnTo?.startsWith("/") ? returnTo : "/billing";
    const stripe = getStripe();
    const customerId = await ensureStripeCustomer(user.id, user.email, user.name);

    if (type === "APPLICATION_FEE") {
      const alreadyPaid = await prisma.payment.findFirst({
        where: { userId: user.id, type: "APPLICATION_FEE", status: "PAID" },
      });
      if (alreadyPaid) {
        return NextResponse.json({ error: "Application fee already paid" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Enrollment Application Fee" },
              unit_amount: APPLICATION_FEE_CENTS,
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}${backTo}${backTo.includes("?") ? "&" : "?"}paid=1`,
        cancel_url: `${origin}${backTo}`,
        metadata: { userId: user.id, type: "APPLICATION_FEE" },
      });

      await prisma.payment.create({
        data: {
          userId: user.id,
          type: "APPLICATION_FEE",
          amountCents: APPLICATION_FEE_CENTS,
          stripeCheckoutSessionId: session.id,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    if (type === "TUITION") {
      if (!submissionId) {
        return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
      }
      const submission = await prisma.submission.findFirst({
        where: { id: submissionId, parentId: user.id },
      });
      if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const data = submission.dataJson as Record<string, unknown>;
      const monthlyAmount = Number(data.monthly_tuition_amount);
      if (!monthlyAmount || monthlyAmount <= 0) {
        return NextResponse.json(
          { error: "No monthly tuition amount on this submission yet" },
          { status: 400 }
        );
      }

      const existingPaid = await prisma.payment.findFirst({
        where: { submissionId, type: "TUITION", status: "PAID" },
      });
      if (existingPaid) {
        return NextResponse.json(
          { error: "Tuition billing is already set up for this submission" },
          { status: 400 }
        );
      }

      const amountCents = Math.round(monthlyAmount * 100);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Monthly Tuition" },
              recurring: { interval: "month" },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}${backTo}${backTo.includes("?") ? "&" : "?"}paid=1`,
        cancel_url: `${origin}${backTo}`,
        metadata: { userId: user.id, type: "TUITION", submissionId },
      });

      await prisma.payment.create({
        data: {
          userId: user.id,
          submissionId,
          type: "TUITION",
          amountCents,
          stripeCheckoutSessionId: session.id,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  } catch (err) {
    return errorResponse(err);
  }
}
