import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { verifyShareLink } from "@/lib/shareLink";
import { buildZodSchema, type FormSchema, type SectionAudience } from "@/lib/forms/schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { email, dataJson, signature } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const result = await verifyShareLink(token, email);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }
  const { link } = result;

  if (!signature?.signerName || !signature?.signatureImg || !signature?.consentText) {
    return NextResponse.json({ error: "A signature is required to submit." }, { status: 422 });
  }

  const schema = link.submission.template.schemaJson as unknown as FormSchema;
  const audience: SectionAudience =
    schema.sections.find((s) => s.audience && s.audience !== "PARENT")?.audience ?? "PHYSICIAN";

  const zodSchema = buildZodSchema(schema, audience);
  const parsed = zodSchema.safeParse(dataJson);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields before submitting.", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  await prisma.$transaction([
    prisma.submission.update({
      where: { id: link.submissionId },
      data: {
        dataJson: { ...(link.submission.dataJson as object), ...parsed.data } as Prisma.InputJsonValue,
        status: "SUBMITTED",
      },
    }),
    prisma.signature.create({
      data: {
        submissionId: link.submissionId,
        signerRole: audience === "DENTIST" ? "DENTIST" : "PHYSICIAN",
        signerName: signature.signerName,
        signerEmail: email.trim().toLowerCase(),
        signatureImg: signature.signatureImg,
        consentText: signature.consentText,
        ipAddress,
        userAgent,
      },
    }),
    prisma.formShareLink.update({
      where: { id: link.id },
      data: { status: "USED", completedAt: new Date() },
    }),
    prisma.activityLog.create({
      data: { submissionId: link.submissionId, action: "SHARE_LINK_COMPLETED", metaJson: { recipientEmail: email } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
