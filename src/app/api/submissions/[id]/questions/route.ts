import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

async function assertAccess(submissionId: string, userId: string) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isOwner = submission.parentId === userId;
  const isApprovedAdmin =
    user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "APPROVED";

  return isOwner || isApprovedAdmin ? submission : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const submission = await assertAccess(id, user.id);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const questions = await prisma.fieldQuestion.findMany({
      where: { submissionId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ questions });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Parent asks a question about a specific field before submitting (Section 2). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { fieldKey, question } = await req.json();

    if (!fieldKey || !question?.trim()) {
      return NextResponse.json({ error: "fieldKey and question are required" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission || submission.parentId !== user.id) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const created = await prisma.fieldQuestion.create({
      data: { submissionId: id, fieldKey, question: question.trim(), askedById: user.id },
    });

    await prisma.activityLog.create({
      data: {
        submissionId: id,
        userId: user.id,
        action: "QUESTION_ASKED",
        metaJson: { fieldKey },
      },
    });

    return NextResponse.json({ question: created });
  } catch (err) {
    return errorResponse(err);
  }
}
