import { NextRequest, NextResponse } from "next/server";
import { requireApprovedAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** CSV export of a filtered submission set for offline record-keeping (Section 7). */
export async function GET(req: NextRequest) {
  try {
    await requireApprovedAdmin();
    const status = req.nextUrl.searchParams.get("status") ?? undefined;

    const submissions = await prisma.submission.findMany({
      where: { status: status as never },
      include: { template: true, parent: true, child: true },
      orderBy: { updatedAt: "desc" },
    });

    const rows = [
      ["Form", "Parent Email", "Child", "Status", "Created At", "Updated At"],
      ...submissions.map((s) => [
        s.template.name,
        s.parent.email,
        s.child?.fullName ?? "",
        s.status,
        s.createdAt.toISOString(),
        s.updatedAt.toISOString(),
      ]),
    ];

    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="submissions${status ? `-${status}` : ""}.csv"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
