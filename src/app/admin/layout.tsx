import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/?signInRequired=1");

  const isApprovedAdmin =
    (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "APPROVED";
  if (!isApprovedAdmin) redirect("/pending-approval");

  return <AdminShell isSuperAdmin={user.role === "SUPER_ADMIN"}>{children}</AdminShell>;
}
