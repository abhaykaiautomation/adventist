import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server";
import { getFormsNav, getPoliciesNav } from "@/lib/nav";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/?signInRequired=1");

  const [forms, policies] = await Promise.all([
    getFormsNav(user.id),
    getPoliciesNav(user.id),
  ]);

  const isApprovedAdmin =
    (user.role === "ADMIN" || user.role === "SUPER_ADMIN") && user.status === "APPROVED";

  return (
    <AppShell forms={forms} policies={policies} isApprovedAdmin={isApprovedAdmin}>
      {children}
    </AppShell>
  );
}
