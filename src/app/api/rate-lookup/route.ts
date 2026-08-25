import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/** Looks up the published monthly tuition rate for a room/schedule/days
 * combination — backs the Schedule and Financial Agreement form's live
 * auto-calculated amount. Returns monthlyRate: null when no rate is
 * published for that combination (e.g. Activity Time isn't offered in
 * Room 1), so the form can prompt the parent to confirm with the office
 * instead of silently showing a wrong number. */
export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    const scheduleType = searchParams.get("scheduleType");
    const daysPerWeek = Number(searchParams.get("daysPerWeek"));

    if (!room || !scheduleType || !daysPerWeek) {
      return NextResponse.json({ error: "room, scheduleType, and daysPerWeek are required" }, { status: 400 });
    }

    const rate = await prisma.rateCard.findFirst({
      where: { room, scheduleType, daysPerWeek, isActive: true },
      orderBy: { schoolYear: "desc" },
    });

    return NextResponse.json({ monthlyRate: rate ? Number(rate.monthlyRate) : null, schoolYear: rate?.schoolYear ?? null });
  } catch (err) {
    return errorResponse(err);
  }
}
