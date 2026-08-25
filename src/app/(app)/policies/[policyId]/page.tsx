import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { AcknowledgeCheckbox } from "@/components/policies/AcknowledgeCheckbox";

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ policyId: string }>;
}) {
  const { policyId } = await params;
  const user = await getServerUser();
  if (!user) return null;

  const policy = await prisma.policyPage.findUnique({ where: { id: policyId } });
  if (!policy || !policy.isActive) notFound();

  let ack;
  if (policy.requiresAcknowledgment) {
    ack = await prisma.policyAcknowledgment.findUnique({
      where: { policyId_userId: { policyId, userId: user.id } },
    });
  } else {
    // Reference-only page (Information / some Parent Consent items) — no
    // checkbox to click, so viewing it is itself the "acknowledgment" that
    // drives the left-nav's read/x-of-y counter.
    const ipAddress = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    ack = await prisma.policyAcknowledgment.upsert({
      where: { policyId_userId: { policyId, userId: user.id } },
      update: {},
      create: { policyId, userId: user.id, ipAddress },
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#f3ede2]">
        {policy.title}
      </h1>

      <article
        className="prose prose-sm prose-invert mt-4 max-w-none rounded-md border border-[#f3ede2]/10 bg-[#241a5e] p-6 prose-headings:font-[family-name:var(--font-fraunces)] prose-headings:text-[#f6c667] prose-a:text-[#f6c667] prose-strong:text-[#f3ede2] prose-th:text-[#f3ede2]"
        dangerouslySetInnerHTML={{ __html: policy.contentHtml }}
      />

      {policy.requiresAcknowledgment ? (
        <div className="mt-4">
          <AcknowledgeCheckbox policyId={policy.id} initiallyAcknowledged={!!ack} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#cdc4ec]">Marked as read.</p>
      )}
    </div>
  );
}
