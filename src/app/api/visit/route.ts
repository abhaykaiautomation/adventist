import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

/**
 * Called once per new browser session (not per navigation) so VisitLog stays
 * a lightweight "who's been on the site" signal per Section 2 of the spec.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    await prisma.visitLog.create({
      data: { userId: user.id, email: user.email, ipAddress },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
