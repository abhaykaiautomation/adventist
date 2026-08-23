import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Looks up an ACTIVE, unexpired share link by its raw token and checks the
 * visitor's claimed email against `recipientEmail` — the "two-factor"
 * anonymous access gate from Section 6 (the link alone isn't the credential).
 */
export async function verifyShareLink(token: string, email: string) {
  const link = await prisma.formShareLink.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { submission: { include: { template: true } } },
  });

  if (!link) return { error: "This link is invalid." as const };
  if (link.status !== "ACTIVE") return { error: "This link has already been used or revoked." as const };
  if (link.expiresAt < new Date()) return { error: "This link has expired." as const };
  if (link.recipientEmail !== email.trim().toLowerCase()) {
    return { error: "That email doesn't match who this link was sent to." as const };
  }

  return { link };
}
