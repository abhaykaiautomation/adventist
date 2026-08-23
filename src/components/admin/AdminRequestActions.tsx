"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminRequestActions({ requestId, status }: { requestId: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function act(action: "approve" | "reject" | "revoke") {
    setBusy(true);
    try {
      await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status === "PENDING") {
    return (
      <div className="flex gap-2">
        <button onClick={() => act("approve")} disabled={busy} className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
          Approve
        </button>
        <button onClick={() => act("reject")} disabled={busy} className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
          Reject
        </button>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <button onClick={() => act("revoke")} disabled={busy} className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50">
        Revoke Access
      </button>
    );
  }

  return null;
}
