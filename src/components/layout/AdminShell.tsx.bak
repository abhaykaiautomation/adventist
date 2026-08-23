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
    { href: "/admin/questions", label: "Open Questions" },
    ...(isSuperAdmin
      ? [
          { href: "/admin/requests", label: "Admin Requests" },
          { href: "/admin/knowledge-base", label: "Knowledge Base" },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r bg-white p-4">
        <Link href="/" className="text-lg font-semibold text-blue-900">
          Admin Dashboard
        </Link>
        <nav className="mt-6 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-md px-3 py-2 text-sm hover:bg-gray-100 ${
                pathname === l.href ? "bg-gray-100 font-medium" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t pt-4 text-sm">
          <Link href="/forms" className="text-blue-700 hover:underline">
            ← Back to parent view
          </Link>
          <p className="mt-2 truncate text-gray-600">{appUser?.email}</p>
          <button onClick={() => signOut()} className="mt-1 text-blue-700 hover:underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
