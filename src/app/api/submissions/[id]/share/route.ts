import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api/errors";

const EXPIRES_IN_DAYS = 14;

/**
 * Parent generates a scoped, email-locked link so a physician can complete
 * the remaining sections without a platform account (Section 6). We store
 * only tokenHash — the raw token is returned once here and never persisted.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { recipientEmail } = await req.json();

    if (!recipientEmail?.trim()) {
      return NextResponse.json({ error: "recipientEmail is required" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission || submission.parentId !== user.id) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }
    if (submission.status !== "AWAITING_EXTERNAL_SIGNER") {
      return NextResponse.json(
        { error: "This form isn't ready to be shared yet — finish and sign your section first." },
        { status: 409 }
      );
    }

    const rawToken = randomBytes(24).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

    await prisma.formShareLink.create({
      data: {
        submissionId: id,
        recipientEmail: recipientEmail.trim().toLowerCase(),
        tokenHash,
        expiresAt,
        createdById: user.id,
      },
    });

    await prisma.activityLog.create({
      data: { submissionId: id, userId: user.id, action: "SHARE_LINK_SENT", metaJson: { recipientEmail } },
    });

    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    return NextResponse.json({ url: `${origin}/share/${rawToken}` });
  } catch (err) {
    return errorResponse(err);
  }
}
