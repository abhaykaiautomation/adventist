"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { FormNavItem, PolicyNavItem } from "@/lib/nav";

const badgeStyles: Record<string, string> = {
  NOT_STARTED: "bg-[#f3ede2]/10 text-[#f3ede2]/60",
  DRAFT: "bg-[#f6c667]/20 text-[#f6c667]",
  SUBMITTED: "bg-emerald-400/20 text-emerald-300",
  NEEDS_CHANGES: "bg-red-400/20 text-red-300",
};

const badgeLabels: Record<string, string> = {
  NOT_STARTED: "Not Started",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CHANGES: "Needs Changes",
};

export function AppShell({
  forms,
  policies,
  isApprovedAdmin,
  children,
}: {
  forms: FormNavItem[];
  policies: PolicyNavItem[];
  isApprovedAdmin: boolean;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { appUser, signOut } = useAuth();

  const nav = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto bg-[#241a5e] p-4 text-[#f3ede2]">
      <div>
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-lg font-semibold"
        >
          Troy Adventist Academy &amp; Preschool
        </Link>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#f3ede2]/50">
          Forms
        </p>
        <ul className="space-y-1">
          {forms.map((f) => (
            <li key={f.id}>
              <Link
                href={`/forms/${f.id}`}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-[#f3ede2]/10 ${
                  pathname === `/forms/${f.id}` ? "bg-[#f3ede2]/10 font-medium" : ""
                }`}
              >
                <span>{f.name}</span>
                <span
                  className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeStyles[f.badge]}`}
                >
                  {badgeLabels[f.badge]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#f3ede2]/50">
          Policies / Instruction Documents
        </p>
        <ul className="space-y-1">
          {policies.map((p) => (
            <li key={p.id}>
              <Link
                href={`/policies/${p.id}`}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-[#f3ede2]/10 ${
                  pathname === `/policies/${p.id}` ? "bg-[#f3ede2]/10 font-medium" : ""
                }`}
              >
                <span>{p.title}</span>
                {p.requiresAcknowledgment && (
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      p.acknowledged
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-[#f6c667]/20 text-[#f6c667]"
                    }`}
                  >
                    {p.acknowledged ? "Acknowledged" : "Needs Ack."}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isApprovedAdmin && (
        <div>
          <Link
            href="/admin"
            className="block rounded-md bg-[#f6c667] px-3 py-2 text-center text-sm font-medium text-[#241a5e] hover:bg-[#f6c667]/90"
          >
            Admin Dashboard
          </Link>
        </div>
      )}

      <div className="mt-auto border-t border-[#f3ede2]/10 pt-4 text-sm">
        <p className="truncate text-[#f3ede2]/60">{appUser?.email}</p>
        <button onClick={() => signOut()} className="mt-1 text-[#f6c667] hover:underline">
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#1a1246]">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-[#f3ede2]/10 md:block">{nav}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-xl">{nav}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-[#f3ede2]/10 bg-[#241a5e] p-4 text-[#f3ede2] md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="rounded-md border border-[#f3ede2]/30 px-3 py-1.5 text-sm"
          >
            ☰
          </button>
          <span className="font-[family-name:var(--font-fraunces)] font-semibold">
            Troy Adventist Academy &amp; Preschool
          </span>
        </header>
        <main className="min-w-0 flex-1 bg-[#1a1246] p-6 text-[#f3ede2]">{children}</main>
      </div>
    </div>
  );
}
