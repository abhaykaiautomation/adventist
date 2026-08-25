import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";
import { ensureStripeCustomer } from "@/lib/stripe/customer";
import { errorResponse } from "@/lib/api/errors";

/**
 * Creates one Stripe Checkout Session for a cart of admin-managed fee items,
 * optionally bundled with setting up monthly tuition autopay in the same
 * session (Stripe's subscription-mode Checkout allows mixing recurring and
 * one-time price_data lines — the one-time lines bill once, immediately,
 * alongside the first invoice).
 *
 * Any available account credit is applied against the one-time subtotal only
 * (never against a recurring line) by reducing each one-time line's amount
 * before it's sent to Stripe — the credit itself isn't actually spent
 * (AccountCredit.remainingCents decremented) until the webhook confirms the
 * session was paid, so an abandoned checkout never burns a family's balance.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { feeItemIds, includeTuition, submissionId, returnTo } = (await req.json()) as {
      feeItemIds?: string[];
      includeTuition?: boolean;
      submissionId?: string;
      returnTo?: string;
    };

    const dedupedIds = [...new Set(feeItemIds ?? [])];
    if (dedupedIds.length === 0 && !includeTuition) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const feeItems = dedupedIds.length
      ? await prisma.feeItem.findMany({ where: { id: { in: dedupedIds }, isActive: true } })
      : [];
    if (feeItems.length !== dedupedIds.length) {
      return NextResponse.json(
        { error: "One or more selected fees are no longer available." },
        { status: 400 }
      );
    }

    let tuitionAmountCents = 0;
    if (includeTuition) {
      if (!submissionId) {
        return NextResponse.json({ error: "submissionId is required to include tuition" }, { status: 400 });
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
      tuitionAmountCents = Math.round(monthlyAmount * 100);
    }

    const oneTimeItems = feeItems.filter((f) => f.type === "ONE_TIME");
    const recurringItems = feeItems.filter((f) => f.type === "RECURRING_MONTHLY");
    const oneTimeSubtotalCents = oneTimeItems.reduce((sum, f) => sum + f.amountCents, 0);

    const credits =
      oneTimeSubtotalCents > 0
        ? await prisma.accountCredit.findMany({
            where: { userId: user.id, remainingCents: { gt: 0 } },
            orderBy: { createdAt: "asc" },
          })
        : [];

    let creditBudget = 0;
    for (const credit of credits) {
      creditBudget += credit.remainingCents;
      if (creditBudget >= oneTimeSubtotalCents) break;
    }
    creditBudget = Math.min(creditBudget, oneTimeSubtotalCents);

    // Walk the credits FIFO, allocating against the one-time lines in order,
    // so we know exactly which AccountCredit rows to (later, in the webhook)
    // decrement and by how much.
    let remainingBudget = creditBudget;
    const creditAllocations: { accountCreditId: string; amountCents: number }[] = [];
    for (const credit of credits) {
      if (remainingBudget <= 0) break;
      const take = Math.min(credit.remainingCents, remainingBudget);
      if (take > 0) {
        creditAllocations.push({ accountCreditId: credit.id, amountCents: take });
        remainingBudget -= take;
      }
    }

    let creditToDistribute = creditBudget;
    const discountedOneTime = oneTimeItems.map((f) => {
      const discount = Math.min(f.amountCents, creditToDistribute);
      creditToDistribute -= discount;
      return { feeItem: f, finalAmountCents: f.amountCents - discount };
    });

    const origin = new URL(req.url).origin;
    const backTo = returnTo?.startsWith("/") ? returnTo : "/cart";
    const stripe = getStripe();
    const customerId = await ensureStripeCustomer(user.id, user.email, user.name);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const { feeItem, finalAmountCents } of discountedOneTime) {
      if (finalAmountCents <= 0) continue; // fully covered by credit — no Stripe line needed
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: feeItem.name },
          unit_amount: finalAmountCents,
        },
        quantity: 1,
      });
    }

    for (const feeItem of recurringItems) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: feeItem.name },
          recurring: { interval: "month" },
          unit_amount: feeItem.amountCents,
        },
        quantity: 1,
      });
    }

    if (includeTuition) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Monthly Tuition" },
          recurring: { interval: "month" },
          unit_amount: tuitionAmountCents,
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "Cart total is fully covered by credit — nothing left to charge." },
        { status: 400 }
      );
    }

    const mode = includeTuition || recurringItems.length > 0 ? "subscription" : "payment";

    const session = await stripe.checkout.sessions.create({
      mode,
      customer: customerId,
      line_items: lineItems,
      success_url: `${origin}${backTo}${backTo.includes("?") ? "&" : "?"}paid=1`,
      cancel_url: `${origin}${backTo}`,
      metadata: { userId: user.id, kind: "CART" },
    });

    await prisma.$transaction([
      prisma.cartOrder.create({
        data: {
          userId: user.id,
          stripeCheckoutSessionId: session.id,
          includesTuition: !!includeTuition,
          creditAppliedCents: creditBudget,
          items: {
            create: discountedOneTime
              .map((d) => ({ feeItemId: d.feeItem.id, amountCents: d.finalAmountCents }))
              .concat(recurringItems.map((f) => ({ feeItemId: f.id, amountCents: f.amountCents }))),
          },
          creditUses: { create: creditAllocations },
        },
      }),
      ...(includeTuition
        ? [
            prisma.payment.create({
              data: {
                userId: user.id,
                submissionId,
                type: "TUITION" as const,
                amountCents: tuitionAmountCents,
                stripeCheckoutSessionId: session.id,
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return errorResponse(err);
  }
}
