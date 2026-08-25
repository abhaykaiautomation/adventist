import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StaffActions } from "@/components/admin/StaffActions";

export default async function AdminStaffPage() {
  const user = await getServerUser();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/admin");

  const [staff, invites] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.staffInvite.findMany({
      where: { usedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-950">Staff</h1>
      <p className="mt-1 text-sm text-gray-600">
        Add a staff member by email and assign their role before they ever sign in — they land as
        an approved admin the moment they first sign in with that Google account.
      </p>

      <div className="mt-4 max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <StaffActions />
      </div>

      {invites.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Pending Invites</h2>
          <ul className="mt-2 space-y-2">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{invite.email}</p>
                  <p className="text-xs text-gray-500">
                    Will become {invite.role.replace("_", " ")} on first sign-in · invited{" "}
                    {new Date(invite.createdAt).toLocaleString()}
                  </p>
                </div>
                <StaffActions revokeInviteId={invite.id} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Current Staff</h2>
        <ul className="mt-2 space-y-2">
          {staff.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{s.name ?? s.email}</p>
                <p className="text-xs text-gray-500">{s.email}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <StatusBadge status={s.role} />
                <StatusBadge status={s.status} />
              </div>
            </li>
          ))}
          {staff.length === 0 && (
            <li className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm">
              No staff yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
