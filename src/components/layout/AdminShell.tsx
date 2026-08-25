"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function AdminShell({
  isSuperAdmin,
  children,
}: {
  isSuperAdmin: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { appUser, signOut } = useAuth();

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/parents", label: "Parent Directory" },
    { href: "/admin/visitors", label: "All Visitors" },
    { href: "/admin/submissions", label: "Submission Queue" },
    { href: "/admin/policies", label: "Policies & Information" },
    { href: "/admin/questions", label: "Open Questions" },
    ...(isSuperAdmin
      ? [
          { href: "/admin/staff", label: "Staff" },
          { href: "/admin/requests", label: "Admin Requests" },
          { href: "/admin/knowledge-base", label: "Knowledge Base" },
        ]
      : []),
  ];

  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-[#f3ede2]/10 bg-[#241a5e] p-4 text-[#f3ede2]">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[#f3ede2]"
        >
          Admin Dashboard
        </Link>
        <nav className="mt-6 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-md px-3 py-2 text-sm hover:bg-[#f3ede2]/10 ${
                pathname === l.href ? "bg-[#f3ede2]/10 font-medium text-[#f6c667]" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-[#f3ede2]/10 pt-4 text-sm">
          <Link href="/forms" className="text-[#f6c667] hover:underline">
            ← Back to parent view
          </Link>
          <p className="mt-2 truncate text-[#cdc4ec]">{appUser?.email}</p>
          <button onClick={() => signOut()} className="mt-1 text-[#f6c667] hover:underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}
