import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { AdminRequestActions } from "@/components/admin/AdminRequestActions";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminRequestsPage() {
  const user = await getServerUser();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/admin");

  const requests = await prisma.adminRequest.findMany({
    orderBy: { requestedAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">Admin Requests</h1>
      <p className="mt-1 text-sm text-gray-600">
        Staff sign in the same way parents do, but dashboard access stays locked
        until you approve it here (Section 3).
      </p>

      <ul className="mt-6 space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-medium text-gray-800">{r.user.name ?? r.user.email}</p>
              <p className="text-xs text-gray-500">{r.user.email}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                <StatusBadge status={r.status} /> requested {new Date(r.requestedAt).toLocaleString()}
              </p>
            </div>
            <AdminRequestActions requestId={r.id} status={r.status} />
          </li>
        ))}
        {requests.length === 0 && (
          <li className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm">
            No admin requests yet.
          </li>
        )}
      </ul>
    </div>
  );
}
