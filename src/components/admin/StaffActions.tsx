"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Two small forms in one component: adding a new staff invite, or (when
 * `revokeInviteId` is passed) a single revoke button for a pending one. */
export function StaffActions({ revokeInviteId }: { revokeInviteId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [message, setMessage] = useState<string | null>(null);

  if (revokeInviteId) {
    async function revoke() {
      setBusy(true);
      try {
        await fetch(`/api/admin/staff/${revokeInviteId}`, { method: "DELETE" });
        router.refresh();
      } finally {
        setBusy(false);
      }
    }

    return (
      <button
        onClick={revoke}
        disabled={busy}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Revoke
      </button>
    );
  }

  async function addStaff() {
    if (!email.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong");
        return;
      }
      setMessage(
        data.appliedImmediately
          ? `${email.trim()} already has an account — access granted immediately.`
          : `Invite saved — ${email.trim()} becomes ${role.replace("_", " ")} on first sign-in.`
      );
      setEmail("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-800">Add staff by email</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="staff@example.com"
          className="flex-1 rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
          className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
        >
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <button
          onClick={addStaff}
          disabled={busy || !email.trim()}
          className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-gray-600">{message}</p>}
    </div>
  );
}
