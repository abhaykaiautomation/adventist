import { NextRequest, NextResponse } from "next/server";
import { requireApprovedAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

const ALLOWED_STATUSES = ["UNDER_REVIEW", "APPROVED", "REJECTED", "NEEDS_CHANGES"] as const;

/** Admin-driven status change (approve/reject/put under review) — Section 7. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireApprovedAdmin();
    const { id } = await params;
    const { status } = await req.json();

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.submission.update({ where: { id }, data: { status } });

    await prisma.activityLog.create({
      data: { submissionId: id, userId: admin.id, action: "ADMIN_STATUS_CHANGED", metaJson: { status } },
    });

    // TODO: notify the parent by email that their submission status changed.

    return NextResponse.json({ submission: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
