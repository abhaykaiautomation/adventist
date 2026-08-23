import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

const EDITABLE_STATUSES = ["DRAFT", "NEEDS_CHANGES"] as const;

/**
 * Save as Draft: writes dataJson, keeps status = DRAFT, no validation,
 * no admin notification (Section 2).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await requireUser();
    const { templateId } = await params;
    const { dataJson } = await req.json();

    const template = await prisma.formTemplate.findUnique({ where: { id: templateId } });
    if (!template) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const existing = await prisma.submission.findFirst({
      where: { templateId, parentId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    if (existing && !EDITABLE_STATUSES.includes(existing.status as (typeof EDITABLE_STATUSES)[number])) {
      return NextResponse.json(
        { error: `This form is already ${existing.status.toLowerCase()} and can't be edited.` },
        { status: 409 }
      );
    }

    const submission = existing
      ? await prisma.submission.update({
          where: { id: existing.id },
          data: { dataJson, status: "DRAFT" },
        })
      : await prisma.submission.create({
          data: { templateId, parentId: user.id, dataJson, status: "DRAFT" },
        });

    await prisma.activityLog.create({
      data: {
        submissionId: submission.id,
        userId: user.id,
        action: existing ? "FIELD_SAVED" : "FORM_STARTED",
      },
    });

    return NextResponse.json({ submissionId: submission.id });
  } catch (err) {
    return errorResponse(err);
  }
}
