import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

/**
 * Parent can withdraw their own question or resolve (accept) an admin's
 * answer. An approved admin can answer an open question. Section 2.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const user = await requireUser();
    const { id: submissionId, questionId } = await params;
    const { action, answer } = await req.json();

    const question = await prisma.fieldQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.submissionId !== submissionId) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isApprovedAdmin =
      (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "APPROVED";
    const isAsker = question.askedById === user.id;

    if (action === "withdraw") {
      if (!isAsker) return NextResponse.json({ error: "Not your question" }, { status: 403 });
      const updated = await prisma.fieldQuestion.update({
        where: { id: questionId },
        data: { status: "WITHDRAWN" },
      });
      return NextResponse.json({ question: updated });
    }

    if (action === "resolve") {
      if (!isAsker) return NextResponse.json({ error: "Not your question" }, { status: 403 });
      const updated = await prisma.fieldQuestion.update({
        where: { id: questionId },
        data: { status: "RESOLVED" },
      });
      return NextResponse.json({ question: updated });
    }

    if (action === "answer") {
      if (!isApprovedAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
      if (!answer?.trim()) {
        return NextResponse.json({ error: "answer is required" }, { status: 400 });
      }
      const updated = await prisma.fieldQuestion.update({
        where: { id: questionId },
        data: {
          answer: answer.trim(),
          answeredBy: user.id,
          answeredAt: new Date(),
          status: "ANSWERED",
        },
      });
      await prisma.activityLog.create({
        data: {
          submissionId,
          userId: user.id,
          action: "ADMIN_ANSWERED_QUESTION",
          metaJson: { fieldKey: question.fieldKey },
        },
      });
      return NextResponse.json({ question: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return errorResponse(err);
  }
}
