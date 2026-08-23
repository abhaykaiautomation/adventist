import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { buildZodSchema, hasExternalSigner, type FormSchema } from "@/lib/forms/schema";
import { errorResponse } from "@/lib/api/errors";

/**
 * Send (final submit): full validation + the open-question gate. Only if
 * both pass does status flip to SUBMITTED (Section 2 / pseudocode in
 * Section 6). This mirrors the client-side gate but is authoritative —
 * a client bug can't bypass it.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { dataJson, signature } = await req.json();

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!submission || submission.parentId !== user.id) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const openQuestions = await prisma.fieldQuestion.count({
      where: { submissionId: id, status: "OPEN" },
    });
    if (openQuestions > 0) {
      return NextResponse.json(
        {
          error: `${openQuestions} unresolved question(s) must be answered or withdrawn before submitting.`,
        },
        { status: 409 }
      );
    }

    const schema = submission.template.schemaJson as unknown as FormSchema;
    const zodSchema = buildZodSchema(schema, "PARENT");
    const parsed = zodSchema.safeParse(dataJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please fix the highlighted fields before submitting.", issues: parsed.error.issues },
        { status: 422 }
      );
    }

    if (!signature?.signerName || !signature?.signatureImg || !signature?.consentText) {
      return NextResponse.json({ error: "A signature is required to submit." }, { status: 422 });
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = req.headers.get("user-agent") ?? "unknown";

    const nextStatus = hasExternalSigner(schema) ? "AWAITING_EXTERNAL_SIGNER" : "SUBMITTED";

    const updated = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.update({
        where: { id },
        data: {
          dataJson: { ...(submission.dataJson as object), ...parsed.data } as Prisma.InputJsonValue,
          status: nextStatus,
        },
      });

      await tx.signature.create({
        data: {
          submissionId: id,
          signerRole: "PARENT",
          signerName: signature.signerName,
          signatureImg: signature.signatureImg,
          consentText: signature.consentText,
          ipAddress,
          userAgent,
        },
      });

      await tx.activityLog.create({
        data: { submissionId: id, userId: user.id, action: "SUBMITTED" },
      });

      return sub;
    });

    // TODO: notify admin (SendGrid) that a submission is ready for review.

    return NextResponse.json({ submissionId: updated.id, status: updated.status });
  } catch (err) {
    return errorResponse(err);
  }
}
