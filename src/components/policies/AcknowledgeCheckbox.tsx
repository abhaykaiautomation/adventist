"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcknowledgeCheckbox({
  policyId,
  initiallyAcknowledged,
}: {
  policyId: string;
  initiallyAcknowledged: boolean;
}) {
  const [acknowledged, setAcknowledged] = useState(initiallyAcknowledged);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function acknowledge() {
    setBusy(true);
    try {
      const res = await fetch(`/api/policies/${policyId}/acknowledge`, { method: "POST" });
      if (res.ok) {
        setAcknowledged(true);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (acknowledged) {
    return (
      <p className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900">
        You acknowledged this policy.
      </p>
    );
  }

  return (
    <label className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <input
        type="checkbox"
        disabled={busy}
        onChange={(e) => e.target.checked && acknowledge()}
        className="mt-0.5"
      />
      <span>I have read and agree to abide by the policy above.</span>
    </label>
  );
}
