import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/** Revokes a pending (not-yet-used) staff invite. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    await prisma.staffInvite.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
