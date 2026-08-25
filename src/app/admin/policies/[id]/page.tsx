import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PolicyContentEditor } from "@/components/admin/PolicyContentEditor";

export default async function AdminPolicyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const policy = await prisma.policyPage.findUnique({ where: { id } });
  if (!policy) notFound();

  return (
    <div>
      <Link href="/admin/policies" className="text-sm text-blue-700 hover:underline">
        ← Policies &amp; Information Pages
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-blue-950">{policy.title}</h1>
      <p className="mt-1 text-sm text-gray-600">
        Parents see this at{" "}
        <a href={`/policies/${policy.id}`} className="text-blue-700 hover:underline">
          /policies/{policy.id}
        </a>
        .
      </p>

      <div className="mt-6">
        <PolicyContentEditor policyId={policy.id} initialContentHtml={policy.contentHtml} />
      </div>
    </div>
  );
}
