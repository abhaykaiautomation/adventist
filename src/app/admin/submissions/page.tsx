import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";

const STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEEDS_CHANGES",
  "AWAITING_EXTERNAL_SIGNER",
  "APPROVED",
  "REJECTED",
] as const;

export default async function SubmissionQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; parentId?: string }>;
}) {
  const { status, parentId } = await searchParams;

  const submissions = await prisma.submission.findMany({
    where: {
      status: status && STATUSES.includes(status as (typeof STATUSES)[number]) ? (status as (typeof STATUSES)[number]) : undefined,
      parentId: parentId || undefined,
    },
    orderBy: { updatedAt: "desc" },
    include: { template: true, parent: true, child: true },
    take: 500,
  });

  // Grouped by parent, most-recently-active parent first.
  const groups = new Map<string, { parent: (typeof submissions)[number]["parent"]; submissions: typeof submissions }>();
  for (const s of submissions) {
    const existing = groups.get(s.parentId);
    if (existing) {
      existing.submissions.push(s);
    } else {
      groups.set(s.parentId, { parent: s.parent, submissions: [s] });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-blue-950">Submission Queue</h1>
        <a
          href={`/api/admin/submissions/export${status ? `?status=${status}` : ""}`}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/submissions" className={`rounded-full px-3 py-1 ${!status ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {[...groups.values()].map(({ parent, submissions: parentSubmissions }) => (
          <div key={parent.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{parent.name ?? parent.email}</p>
                {parent.name && <p className="text-xs text-gray-500">{parent.email}</p>}
              </div>
              <span className="text-xs text-gray-500">
                {parentSubmissions.length} submission{parentSubmissions.length === 1 ? "" : "s"}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3">Form</th>
                  <th className="p-3">Child</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {parentSubmissions.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="p-3">
                      <Link href={`/admin/submissions/${s.id}`} className="text-blue-700 hover:underline">
                        {s.template.name}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-700">{s.child?.fullName ?? "—"}</td>
                    <td className="p-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="p-3 text-gray-600">{new Date(s.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {groups.size === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
            No submissions match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
