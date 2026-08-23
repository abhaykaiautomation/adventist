import { prisma } from "@/lib/prisma";

export default async function AllVisitorsPage() {
  const visits = await prisma.visitLog.findMany({
    orderBy: { signedInAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, role: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">All Visitors</h1>
      <p className="mt-1 text-sm text-gray-600">
        Everyone who has ever signed in — including parents who never started a form
        (Section 2).
      </p>

      <div className="mt-6 overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Signed In At</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id} className="border-b last:border-0">
                <td className="p-3">{v.email}</td>
                <td className="p-3">{v.user.name ?? "—"}</td>
                <td className="p-3">{v.user.role}</td>
                <td className="p-3 text-gray-600">{new Date(v.signedInAt).toLocaleString()}</td>
                <td className="p-3 text-gray-500">{v.ipAddress ?? "—"}</td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No visits logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
