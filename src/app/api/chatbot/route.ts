import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { answerChatbotQuestion } from "@/lib/rag/chat";
import { errorResponse } from "@/lib/api/errors";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { question, formTemplateId, formName } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const result = await answerChatbotQuestion(question.trim(), formName);

    // Every chatbot Q&A is logged so admins can see what parents get confused about (Section 8).
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "CHATBOT_QUESTION",
        metaJson: { question: question.trim(), formTemplateId: formTemplateId ?? null, sources: result.sources },
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
