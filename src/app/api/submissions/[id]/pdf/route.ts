import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { generateFormPdf, type PdfVariant } from "@/lib/pdf/generateFormPdf";
import type { FormSchema } from "@/lib/forms/schema";
import { errorResponse } from "@/lib/api/errors";

/**
 * Same rendering pipeline as the blank-template PDF, fed with dataJson +
 * Signature rows and a status-driven watermark — one pipeline, not three
 * (Section 2).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { template: true, signatures: true },
    });
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const isOwner = submission.parentId === user.id;
    const isApprovedAdmin =
      (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "APPROVED";
    if (!isOwner && !isApprovedAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const variant: PdfVariant = submission.status === "DRAFT" || submission.status === "NEEDS_CHANGES"
      ? "draft"
      : "submitted";

    const pdfBytes = await generateFormPdf({
      templateName: submission.template.name,
      schema: submission.template.schemaJson as unknown as FormSchema,
      dataJson: submission.dataJson as Record<string, unknown>,
      signatures: submission.signatures.map((s) => ({
        signerRole: s.signerRole,
        signerName: s.signerName,
        signatureImg: s.signatureImg,
        signedAt: s.signedAt,
      })),
      variant,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${submission.template.name}-${variant}.pdf"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
