"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RequestAdminAccessPage() {
  const { appUser, refreshAppUser } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestAccess() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/request-access", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not submit request.");
        return;
      }
      await refreshAppUser();
      router.push("/pending-approval");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-blue-950">Request Staff / Admin Access</h1>
      <p className="mt-3 text-sm text-gray-600">
        If you&apos;re a member of school staff and need dashboard access to review
        parent submissions, request it here. A super-admin will need to approve
        your request before the dashboard unlocks.
      </p>

      {appUser?.role !== "PARENT" && (
        <p className="mt-4 rounded-md border bg-gray-50 p-3 text-sm text-gray-700">
          Current status: <strong>{appUser?.adminRequestStatus ?? appUser?.status}</strong>
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={requestAccess}
        disabled={busy}
        className="mt-5 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
      >
        Request Access
      </button>
    </div>
  );
}
