import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { setAdminClaim } from "@/lib/firebase/admin";
import { errorResponse } from "@/lib/api/errors";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

/**
 * Pre-authorizes a staff member by email before they've ever signed in,
 * skipping the normal request/approve flow. If that email already has a
 * User row (parent, or an ADMIN still pending), the role/status change
 * applies immediately instead of waiting for a StaffInvite to be consumed
 * on next sign-in.
 */
export async function POST(req: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin();
    const { email, role } = (await req.json()) as { email?: string; role?: string };

    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
      return NextResponse.json({ error: "A valid email and role are required" }, { status: 400 });
    }
    const grantedRole = role as "ADMIN" | "SUPER_ADMIN";

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: grantedRole, status: "APPROVED" },
      });
      await prisma.adminRequest.upsert({
        where: { userId: existingUser.id },
        update: { status: "APPROVED", reviewedBy: superAdmin.id, reviewedAt: new Date() },
        create: {
          userId: existingUser.id,
          status: "APPROVED",
          reviewedBy: superAdmin.id,
          reviewedAt: new Date(),
        },
      });
      await setAdminClaim(existingUser.firebaseUid, grantedRole);
      return NextResponse.json({ ok: true, appliedImmediately: true });
    }

    await prisma.staffInvite.upsert({
      where: { email: normalizedEmail },
      update: { role: grantedRole, invitedBy: superAdmin.id, usedAt: null },
      create: { email: normalizedEmail, role: grantedRole, invitedBy: superAdmin.id },
    });

    return NextResponse.json({ ok: true, appliedImmediately: false });
  } catch (err) {
    return errorResponse(err);
  }
}
