import { notFound } from "next/navigation";
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

  const ack = policy.requiresAcknowledgment
    ? await prisma.policyAcknowledgment.findUnique({
        where: { policyId_userId: { policyId, userId: user.id } },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-blue-950">{policy.title}</h1>

      <article
        className="prose prose-sm mt-4 max-w-none rounded-md border bg-white p-6"
        dangerouslySetInnerHTML={{ __html: policy.contentHtml }}
      />

      {policy.requiresAcknowledgment && (
        <div className="mt-4">
          <AcknowledgeCheckbox policyId={policy.id} initiallyAcknowledged={!!ack} />
        </div>
      )}
    </div>
  );
}
