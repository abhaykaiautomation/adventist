"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreditActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function issueCredit() {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amountCents || amountCents <= 0 || !reason.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amountCents, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong");
        return;
      }
      setAmount("");
      setReason("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Amount ($)"
        className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 sm:w-32"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (e.g. prorated adjustment for late start)"
        className="flex-1 rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
      />
      <button
        onClick={issueCredit}
        disabled={busy || !amount || !reason.trim()}
        className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
      >
        Issue Credit
      </button>
      {message && <p className="text-xs text-red-600">{message}</p>}
    </div>
  );
}
