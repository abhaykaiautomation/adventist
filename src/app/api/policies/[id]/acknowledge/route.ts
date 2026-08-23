import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/** Timestamped per parent/version acknowledgment (Section 2). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const policy = await prisma.policyPage.findUnique({ where: { id } });
    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const ack = await prisma.policyAcknowledgment.upsert({
      where: { policyId_userId: { policyId: id, userId: user.id } },
      update: { acknowledgedAt: new Date(), ipAddress },
      create: { policyId: id, userId: user.id, ipAddress },
    });

    return NextResponse.json({ acknowledgment: ack });
  } catch (err) {
    return errorResponse(err);
  }
}
