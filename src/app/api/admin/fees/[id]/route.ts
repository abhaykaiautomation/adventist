import { NextRequest, NextResponse } from "next/server";
import { requireApprovedAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

const MIN_AMOUNT_CENTS = 50; // Stripe's USD minimum charge

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApprovedAdmin();
    const { id } = await params;
    const { name, description, amountCents, type, sortOrder, isActive } = (await req.json()) as {
      name?: string;
      description?: string | null;
      amountCents?: number;
      type?: "ONE_TIME" | "RECURRING_MONTHLY";
      sortOrder?: number;
      isActive?: boolean;
    };

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    if (amountCents !== undefined && (!Number.isInteger(amountCents) || amountCents < MIN_AMOUNT_CENTS)) {
      return NextResponse.json(
        { error: `Amount must be at least $${(MIN_AMOUNT_CENTS / 100).toFixed(2)}` },
        { status: 400 }
      );
    }
    if (type !== undefined && type !== "ONE_TIME" && type !== "RECURRING_MONTHLY") {
      return NextResponse.json({ error: "Invalid fee type" }, { status: 400 });
    }

    const feeItem = await prisma.feeItem.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description?.trim() || null : undefined,
        amountCents,
        type,
        sortOrder,
        isActive,
      },
    });

    return NextResponse.json({ feeItem });
  } catch (err) {
    return errorResponse(err);
  }
}
