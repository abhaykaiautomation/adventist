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
  REJECTED: "bg-red-400/20 text-red-300",
};

const badgeLabels: Record<string, string> = {
  NOT_STARTED: "Not Started",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CHANGES: "Needs Changes",
  REJECTED: "Rejected",
};

interface NavListItem {
  id: string;
  href: string;
  label: string;
  done: boolean;
  badgeText: string;
  badgeClass: string;
}

/** A left-nav heading that expands/collapses its own list — Forms,
 * Information, Policies, and Parent Consent each toggle independently and
 * default to collapsed, showing a "done/total" progress count (a submitted
 * form, an acknowledged policy, or a viewed reference page all count). */
function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavListItem[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const doneCount = items.filter((i) => i.done).length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#f3ede2]/50 hover:text-[#f3ede2]/80"
      >
        <span>
          {title} <span className="text-[#f3ede2]/40">({doneCount}/{items.length})</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-[#f3ede2]/10 ${
                  pathname === item.href ? "bg-[#f3ede2]/10 font-medium" : ""
                }`}
              >
                <span>{item.label}</span>
                {item.badgeText && (
                  <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${item.badgeClass}`}>
                    {item.badgeText}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AppShell({
  forms,
  policies,
  children,
}: {
  forms: FormNavItem[];
  policies: PolicyNavItem[];
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { appUser, signOut } = useAuth();

  function formItem(f: FormNavItem): NavListItem {
    return {
      id: f.id,
      href: `/forms/${f.id}`,
      label: f.name,
      done: f.badge === "SUBMITTED",
      badgeText: badgeLabels[f.badge],
      badgeClass: badgeStyles[f.badge],
    };
  }

  function policyItem(p: PolicyNavItem): NavListItem {
    return {
      id: p.id,
      href: `/policies/${p.id}`,
      label: p.title,
      done: p.acknowledged,
      badgeText: p.requiresAcknowledgment ? (p.acknowledged ? "Acknowledged" : "Needs Ack.") : "",
      badgeClass: p.acknowledged ? "bg-emerald-400/20 text-emerald-300" : "bg-[#f6c667]/20 text-[#f6c667]",
    };
  }

  const formsItems = forms.filter((f) => f.category === "FORMS").map(formItem);
  const informationItems = policies.filter((p) => p.category === "INFORMATION").map(policyItem);
  const policiesItems = policies.filter((p) => p.category === "POLICIES").map(policyItem);
  const consentItems = [
    ...forms.filter((f) => f.category === "PARENT_CONSENT").map(formItem),
    ...policies.filter((p) => p.category === "PARENT_CONSENT").map(policyItem),
  ];

  const nav = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto bg-[#241a5e] p-4 text-[#f3ede2]">
      <NavSection title="Forms" items={formsItems} pathname={pathname} />
      <NavSection title="Information" items={informationItems} pathname={pathname} />
      <NavSection title="Policies" items={policiesItems} pathname={pathname} />
      <NavSection title="Parent Consent" items={consentItems} pathname={pathname} />

      <div className="mt-auto border-t border-[#f3ede2]/10 pt-4 text-sm">
        <p className="truncate text-[#f3ede2]/60">{appUser?.email}</p>
        <button onClick={() => signOut()} className="mt-1 text-[#f6c667] hover:underline">
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-full bg-[#1a1246]">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-[#f3ede2]/10 md:block">{nav}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-xl">{nav}</aside>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-[#f3ede2]/10 bg-[#241a5e] p-4 text-[#f3ede2] md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="rounded-md border border-[#f3ede2]/30 p-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[#f3ede2]/70">Menu</span>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#1a1246] p-6 text-[#f3ede2]">
          {children}
        </main>
      </div>
    </div>
  );
}
