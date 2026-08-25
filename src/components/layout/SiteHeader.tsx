"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { CartWidget } from "@/components/cart/CartWidget";

/** The one header shown at the top of every page — landing, forms/policies,
 * and admin alike — so branding, primary nav, and auth state never diverge
 * per-shell the way they used to. */
export function SiteHeader() {
  const { appUser, loading, signIn, signOut } = useAuth();
  const pathname = usePathname();
  const firstName = appUser?.name?.split(" ")[0] || appUser?.email?.split("@")[0];
  const isApprovedAdmin =
    (appUser?.role === "ADMIN" || appUser?.role === "SUPER_ADMIN") && appUser?.status === "APPROVED";

  function navLinkClass(active: boolean) {
    return active
      ? "text-[#f6c667] underline decoration-2 underline-offset-4"
      : "text-[#f3ede2] hover:text-[#f6c667]";
  }

  return (
    <header className="relative z-20 shrink-0 border-b border-[#f3ede2]/10 bg-[#241a5e] px-6 py-3 text-[#f3ede2] sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex shrink-0 items-center rounded-lg bg-[#f3ede2] px-2.5 py-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/TAA-Logo-2019-r.png"
              alt="Troy Adventist Academy"
              className="h-7 w-auto sm:h-9"
            />
          </div>
          <div className="leading-tight">
            <div
              className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#f6c667] sm:text-xs"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              &amp; Preschool
            </div>
            <div className="mt-1 text-[0.65rem] leading-snug text-[#cdc4ec]">
              ADD: 2777 Crooks Road, Troy, Michigan 48084
              <br />
              Phone: 248-712-4075
            </div>
          </div>
        </Link>

        <div className="flex flex-col items-end gap-2 text-xs font-medium uppercase tracking-wide">
          <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
            <Link href="/our-mission" className={navLinkClass(pathname === "/our-mission")}>
              Our Mission
            </Link>

            {appUser ? (
              <Link
                href="/forms"
                className={`flex items-center gap-1 ${
                  pathname.startsWith("/forms") || pathname.startsWith("/policies")
                    ? "text-[#f6c667] underline decoration-2 underline-offset-4"
                    : "text-[#f6c667]"
                }`}
              >
                Enrollment <span aria-hidden="true">&#8599;</span>
              </Link>
            ) : (
              <button onClick={() => signIn()} className="flex items-center gap-1 text-[#f6c667]">
                Enrollment <span aria-hidden="true">&#8599;</span>
              </button>
            )}

            {isApprovedAdmin && (
              <Link href="/admin" className={navLinkClass(pathname.startsWith("/admin"))}>
                Admin Dashboard
              </Link>
            )}
          </nav>

          {loading ? null : appUser ? (
            <div className="flex items-center gap-3 normal-case text-[#f3ede2]">
              <CartWidget />
              <span>
                Hello, <span className="font-semibold">{firstName}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="text-[#cdc4ec] uppercase tracking-wide hover:text-[#f3ede2]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => signIn()} className="text-[#f3ede2]">
                Sign In
              </button>
              {!loading && (
                <p className="absolute right-0 top-full mt-2 hidden whitespace-nowrap normal-case text-[#f6c667] sm:block">
                  Please sign in to continue — everything past this page requires a Google account.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
