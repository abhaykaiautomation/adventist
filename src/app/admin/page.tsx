import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [parents, submissions, openQuestions, pendingRequests, visitors] = await Promise.all([
    prisma.user.count({ where: { role: "PARENT" } }),
    prisma.submission.groupBy({ by: ["status"], _count: true }),
    prisma.fieldQuestion.count({ where: { status: "OPEN" } }),
    prisma.adminRequest.count({ where: { status: "PENDING" } }),
    prisma.visitLog.findMany({ distinct: ["userId"], select: { userId: true } }),
  ]);

  const submissionCounts = Object.fromEntries(submissions.map((s) => [s.status, s._count]));

  const tiles = [
    { label: "Parents", value: parents, href: "/admin/parents" },
    { label: "Unique Visitors", value: visitors.length, href: "/admin/visitors" },
    { label: "Draft Submissions", value: submissionCounts.DRAFT ?? 0, href: "/admin/submissions?status=DRAFT" },
    { label: "Submitted", value: submissionCounts.SUBMITTED ?? 0, href: "/admin/submissions?status=SUBMITTED" },
    { label: "Needs Changes", value: submissionCounts.NEEDS_CHANGES ?? 0, href: "/admin/submissions?status=NEEDS_CHANGES" },
    { label: "Open Questions", value: openQuestions, href: "/admin/questions" },
    { label: "Pending Admin Requests", value: pendingRequests, href: "/admin/requests" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="rounded-lg border bg-white p-4 shadow-sm hover:border-blue-300"
          >
            <p className="text-3xl font-semibold text-blue-950">{t.value}</p>
            <p className="mt-1 text-sm text-gray-600">{t.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
