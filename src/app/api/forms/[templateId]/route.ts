import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await requireUser();
    const { templateId } = await params;

    const template = await prisma.formTemplate.findUnique({ where: { id: templateId } });
    if (!template) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const submission = await prisma.submission.findFirst({
      where: { templateId, parentId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { fieldQuestions: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json({
      template: { id: template.id, name: template.name, schemaJson: template.schemaJson },
      submission: submission
        ? {
            id: submission.id,
            dataJson: submission.dataJson,
            status: submission.status,
            fieldQuestions: submission.fieldQuestions,
          }
        : null,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
