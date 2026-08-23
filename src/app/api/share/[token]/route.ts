import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyShareLink } from "@/lib/shareLink";
import { sectionsForAudience, type FormSchema } from "@/lib/forms/schema";

/**
 * No Firebase login here by design (Section 6) — access is gated purely by
 * knowing both the token AND the recipient email it was sent to.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { email } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const result = await verifyShareLink(token, email);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  const { link } = result;
  if (!link.accessedAt) {
    await prisma.formShareLink.update({ where: { id: link.id }, data: { accessedAt: new Date() } });
  }

  const schema = link.submission.template.schemaJson as unknown as FormSchema;
  const audience = schema.sections.find((s) => s.audience && s.audience !== "PARENT")?.audience ?? "PHYSICIAN";

  return NextResponse.json({
    formName: link.submission.template.name,
    audience,
    readOnlySections: sectionsForAudience(schema, "PARENT"),
    editableSections: sectionsForAudience(schema, audience),
    readOnlyData: link.submission.dataJson,
  });
}
