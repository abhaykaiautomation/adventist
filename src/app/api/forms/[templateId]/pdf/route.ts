import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { generateFormPdf } from "@/lib/pdf/generateFormPdf";
import type { FormSchema } from "@/lib/forms/schema";
import { errorResponse } from "@/lib/api/errors";

/** Clean, printable PDF of the empty form (Section 2). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    await requireUser();
    const { templateId } = await params;

    const template = await prisma.formTemplate.findUnique({ where: { id: templateId } });
    if (!template) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const pdfBytes = await generateFormPdf({
      templateName: template.name,
      schema: template.schemaJson as unknown as FormSchema,
      dataJson: null,
      signatures: [],
      variant: "blank",
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${template.name}-blank.pdf"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
