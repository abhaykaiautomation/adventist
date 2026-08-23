import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/**
 * Staff member requests dashboard access (Section 3, step 1-2). Flips them
 * to role=ADMIN / status=PENDING and opens an AdminRequest row for a
 * super-admin to review. Idempotent — re-requesting doesn't create dupes.
 */
export async function POST() {
  try {
    const user = await requireUser();

    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Already a super-admin" }, { status: 400 });
    }
    if (user.role === "ADMIN" && user.status === "APPROVED") {
      return NextResponse.json({ error: "Already an approved admin" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN", status: "PENDING" },
    });

    await prisma.adminRequest.upsert({
      where: { userId: user.id },
      update: { status: "PENDING", reviewedBy: null, reviewedAt: null },
      create: { userId: user.id, status: "PENDING" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
