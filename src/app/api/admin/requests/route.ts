import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/** Super-admin only: list every admin request, newest first. */
export async function GET() {
  try {
    await requireSuperAdmin();

    const requests = await prisma.adminRequest.findMany({
      orderBy: { requestedAt: "desc" },
      include: { user: { select: { id: true, email: true, name: true, status: true, role: true } } },
    });

    return NextResponse.json({ requests });
  } catch (err) {
    return errorResponse(err);
  }
}
