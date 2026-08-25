import { NextRequest, NextResponse } from "next/server";
import { requireApprovedAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

const MIN_AMOUNT_CENTS = 50; // Stripe's USD minimum charge

export async function POST(req: NextRequest) {
  try {
    await requireApprovedAdmin();
    const { name, description, amountCents, type, sortOrder } = (await req.json()) as {
      name?: string;
      description?: string;
      amountCents?: number;
      type?: "ONE_TIME" | "RECURRING_MONTHLY";
      sortOrder?: number;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!Number.isInteger(amountCents) || (amountCents as number) < MIN_AMOUNT_CENTS) {
      return NextResponse.json(
        { error: `Amount must be at least $${(MIN_AMOUNT_CENTS / 100).toFixed(2)}` },
        { status: 400 }
      );
    }
    if (type && type !== "ONE_TIME" && type !== "RECURRING_MONTHLY") {
      return NextResponse.json({ error: "Invalid fee type" }, { status: 400 });
    }

    const feeItem = await prisma.feeItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        amountCents: amountCents as number,
        type: type ?? "ONE_TIME",
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ feeItem });
  } catch (err) {
    return errorResponse(err);
  }
}
