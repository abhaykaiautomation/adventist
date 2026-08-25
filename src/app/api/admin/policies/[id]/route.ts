import { NextRequest, NextResponse } from "next/server";
import { requireApprovedAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/** Admin edits a policy/reference page's content — e.g. the lunch menu.
 * Parents see the update immediately since the enrollment-side page reads
 * contentHtml live on every request. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApprovedAdmin();
    const { id } = await params;
    const { contentHtml } = await req.json();

    if (!contentHtml?.trim()) {
      return NextResponse.json({ error: "contentHtml is required" }, { status: 400 });
    }

    const policy = await prisma.policyPage.update({
      where: { id },
      data: { contentHtml, version: { increment: 1 } },
    });

    return NextResponse.json({ policy });
  } catch (err) {
    return errorResponse(err);
  }
}
