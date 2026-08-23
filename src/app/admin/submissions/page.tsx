import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    take: 200,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-blue-950">Submission Queue</h1>
        <a
          href={`/api/admin/submissions/export${status ? `?status=${status}` : ""}`}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/submissions" className={`rounded-full px-3 py-1 ${!status ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}>
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Form</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Child</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3">
                  <Link href={`/admin/submissions/${s.id}`} className="text-blue-700 hover:underline">
                    {s.template.name}
                  </Link>
                </td>
                <td className="p-3">{s.parent.email}</td>
                <td className="p-3">{s.child?.fullName ?? "—"}</td>
                <td className="p-3">{s.status.replace("_", " ")}</td>
                <td className="p-3 text-gray-600">{new Date(s.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No submissions match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
