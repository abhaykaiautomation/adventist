import Link from "next/link";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export default async function PendingApprovalPage() {
  const user = await getServerUser();
  const adminRequest = user
    ? await prisma.adminRequest.findUnique({ where: { userId: user.id } })
    : null;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-blue-950">Staff Access</h1>

      {adminRequest?.status === "PENDING" && (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Your request for admin dashboard access is awaiting approval from a
          super-admin. You&apos;ll be able to access the dashboard as soon as it&apos;s
          approved — no need to sign up again.
        </p>
      )}

      {adminRequest?.status === "REJECTED" && (
        <p className="mt-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          Your request for admin dashboard access was not approved. Contact the
          school office if you believe this is a mistake.
        </p>
      )}

      {!adminRequest && (
        <p className="mt-4 rounded-md border bg-gray-50 p-4 text-sm text-gray-700">
          You haven&apos;t requested admin dashboard access yet.{" "}
          <Link href="/request-admin-access" className="text-blue-700 hover:underline">
            Request it here.
          </Link>
        </p>
      )}
    </div>
  );
}
