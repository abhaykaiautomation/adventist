import { NextRequest, NextResponse } from "next/server";
import { requireApprovedAdmin } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/**
 * Inline help/intervention (Section 7): admin leaves a comment on a specific
 * field, which flips the submission to NEEDS_CHANGES. The comment is stored
 * as a FieldQuestion the admin both raises and answers, so it renders in the
 * same per-field thread the parent already sees while filling the form.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireApprovedAdmin();
    const { id } = await params;
    const { fieldKey, comment } = await req.json();

    if (!fieldKey || !comment?.trim()) {
      return NextResponse.json({ error: "fieldKey and comment are required" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.fieldQuestion.create({
        data: {
          submissionId: id,
          fieldKey,
          question: "(Admin note)",
          askedById: admin.id,
          answer: comment.trim(),
          answeredBy: admin.id,
          answeredAt: new Date(),
          status: "ANSWERED",
        },
      }),
      prisma.submission.update({ where: { id }, data: { status: "NEEDS_CHANGES" } }),
      prisma.activityLog.create({
        data: {
          submissionId: id,
          userId: admin.id,
          action: "ADMIN_COMMENTED",
          metaJson: { fieldKey, comment: comment.trim() },
        },
      }),
    ]);

    // TODO: notify the parent by email that changes were requested.

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
