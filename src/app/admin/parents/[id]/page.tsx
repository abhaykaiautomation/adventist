import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CreditActions } from "@/components/admin/CreditActions";

export default async function AdminParentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const parent = await prisma.user.findUnique({
    where: { id },
    include: {
      children: true,
      submissions: { include: { template: true }, orderBy: { updatedAt: "desc" } },
      accountCredits: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!parent || parent.role !== "PARENT") notFound();

  const totalRemainingCredit = parent.accountCredits.reduce((sum, c) => sum + c.remainingCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-blue-950">{parent.name ?? parent.email}</h1>
        <p className="text-sm text-gray-600">{parent.email}</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Children</h2>
        <ul className="mt-2 text-sm text-gray-700">
          {parent.children.map((c) => (
            <li key={c.id}>{c.fullName}</li>
          ))}
          {parent.children.length === 0 && <li className="text-gray-500">None on file.</li>}
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Submissions</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {parent.submissions.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <Link href={`/admin/submissions/${s.id}`} className="text-blue-700 hover:underline">
                {s.template.name}
              </Link>
              <StatusBadge status={s.status} />
            </li>
          ))}
          {parent.submissions.length === 0 && <li className="text-gray-500">No submissions yet.</li>}
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-gray-500">
          Account Credits — ${(totalRemainingCredit / 100).toFixed(2)} available
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Auto-applied against one-time fees the next time this family checks out from the cart.
        </p>

        <div className="mt-3">
          <CreditActions userId={parent.id} />
        </div>

        <ul className="mt-4 space-y-2 text-sm">
          {parent.accountCredits.map((c) => (
            <li key={c.id} className="rounded border border-gray-100 bg-gray-50 p-2">
              <p className="font-medium text-gray-800">
                ${(c.amountCents / 100).toFixed(2)} issued — ${(c.remainingCents / 100).toFixed(2)}{" "}
                remaining
              </p>
              <p className="text-xs text-gray-500">
                {c.reason} · {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
          {parent.accountCredits.length === 0 && (
            <li className="text-gray-500">No credits issued yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
