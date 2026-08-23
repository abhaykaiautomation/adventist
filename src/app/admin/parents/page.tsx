import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ParentDirectoryPage() {
  const parents = await prisma.user.findMany({
    where: { role: "PARENT" },
    orderBy: { createdAt: "desc" },
    include: {
      children: true,
      submissions: { select: { id: true, status: true } },
      visitLogs: { orderBy: { signedInAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">Parent Directory</h1>

      <div className="mt-6 overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Parent</th>
              <th className="p-3">Children</th>
              <th className="p-3">Submissions</th>
              <th className="p-3">Last Visited</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">
                  <p className="font-medium text-gray-800">{p.name ?? p.email}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </td>
                <td className="p-3">
                  {p.children.map((c) => c.fullName).join(", ") || "—"}
                </td>
                <td className="p-3">
                  <Link href={`/admin/submissions?parentId=${p.id}`} className="text-blue-700 hover:underline">
                    {p.submissions.length} submission{p.submissions.length === 1 ? "" : "s"}
                  </Link>
                </td>
                <td className="p-3 text-gray-600">
                  {p.visitLogs[0] ? new Date(p.visitLogs[0].signedInAt).toLocaleString() : "Never"}
                </td>
              </tr>
            ))}
            {parents.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No parents have signed in yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
