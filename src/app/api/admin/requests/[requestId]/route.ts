import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { setAdminClaim, clearAdminClaim } from "@/lib/firebase/admin";
import { errorResponse } from "@/lib/api/errors";

/**
 * Approve / reject / revoke an admin request (Section 3, steps 3-5).
 * Postgres stays the source of truth; the Firebase custom claim is set only
 * on approval and cleared on reject/revoke — every API route still
 * re-verifies role/status server-side rather than trusting the claim alone.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const superAdmin = await requireSuperAdmin();
    const { requestId } = await params;
    const { action } = await req.json();

    const adminRequest = await prisma.adminRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });
    if (!adminRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      await setAdminClaim(adminRequest.user.firebaseUid, "ADMIN");
      await prisma.$transaction([
        prisma.user.update({ where: { id: adminRequest.userId }, data: { status: "APPROVED" } }),
        prisma.adminRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED", reviewedBy: superAdmin.id, reviewedAt: new Date() },
        }),
      ]);
      return NextResponse.json({ ok: true });
    }

    if (action === "reject") {
      await clearAdminClaim(adminRequest.user.firebaseUid);
      await prisma.$transaction([
        prisma.user.update({ where: { id: adminRequest.userId }, data: { status: "REVOKED" } }),
        prisma.adminRequest.update({
          where: { id: requestId },
          data: { status: "REJECTED", reviewedBy: superAdmin.id, reviewedAt: new Date() },
        }),
      ]);
      return NextResponse.json({ ok: true });
    }

    if (action === "revoke") {
      await clearAdminClaim(adminRequest.user.firebaseUid);
      await prisma.user.update({ where: { id: adminRequest.userId }, data: { status: "REVOKED" } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return errorResponse(err);
  }
}
