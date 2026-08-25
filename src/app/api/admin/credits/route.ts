import { NextRequest, NextResponse } from "next/server";
import { requireApprovedAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/** Issues an account credit for a family — applied automatically against the
 * one-time portion of their next cart checkout(s) (see /api/payments/cart-checkout). */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireApprovedAdmin();
    const { userId, amountCents, reason } = (await req.json()) as {
      userId?: string;
      amountCents?: number;
      reason?: string;
    };

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    if (!Number.isInteger(amountCents) || (amountCents as number) <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }
    if (!reason?.trim()) {
      return NextResponse.json({ error: "A reason is required" }, { status: 400 });
    }

    const credit = await prisma.accountCredit.create({
      data: {
        userId,
        amountCents: amountCents as number,
        remainingCents: amountCents as number,
        reason: reason.trim(),
        issuedBy: admin.id,
      },
    });

    return NextResponse.json({ credit });
  } catch (err) {
    return errorResponse(err);
  }
}
