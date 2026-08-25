"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

interface FeeItemData {
  id: string;
  name: string;
  description: string | null;
  amountCents: number;
  type: "ONE_TIME" | "RECURRING_MONTHLY";
}

export function CartCheckout({
  feeItems,
  tuition,
  availableCreditCents,
}: {
  feeItems: FeeItemData[];
  tuition: { submissionId: string; monthlyAmountCents: number } | null;
  availableCreditCents: number;
}) {
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [includeTuition, setIncludeTuition] = useState(false);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(
    searchParams.get("paid") === "1" ? "Payment received by Stripe — this updates below once it's confirmed." : null
  );

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const { oneTimeSubtotalCents, recurringSubtotalCents } = useMemo(() => {
    let oneTime = 0;
    let recurring = 0;
    for (const f of feeItems) {
      if (!selectedIds.has(f.id)) continue;
      if (f.type === "ONE_TIME") oneTime += f.amountCents;
      else recurring += f.amountCents;
    }
    return { oneTimeSubtotalCents: oneTime, recurringSubtotalCents: recurring };
  }, [feeItems, selectedIds]);

  const creditApplied = Math.min(availableCreditCents, oneTimeSubtotalCents);
  const oneTimeDueCents = oneTimeSubtotalCents - creditApplied;
  const recurringTotalCents = recurringSubtotalCents + (includeTuition && tuition ? tuition.monthlyAmountCents : 0);

  async function checkout() {
    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch("/api/payments/cart-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeItemIds: [...selectedIds],
          includeTuition,
          submissionId: tuition?.submissionId,
          returnTo: "/cart",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBanner(data.error ?? `Couldn't start checkout (HTTP ${res.status}).`);
      }
    } catch (err) {
      console.error("cart checkout failed", err);
      setBanner("Something went wrong starting checkout — check the browser console for details.");
    } finally {
      setBusy(false);
    }
  }

  const hasSelection = selectedIds.size > 0 || includeTuition;

  return (
    <div className="space-y-4">
      {banner && (
        <div className="rounded-md border border-[#f6c667]/40 bg-[#f6c667]/10 p-3 text-sm text-[#f6c667]">
          {banner}
        </div>
      )}

      <div className="space-y-2">
        {feeItems.map((f) => (
          <label
            key={f.id}
            className="flex items-start gap-3 rounded-md border border-[#f3ede2]/20 p-3 text-sm text-[#f3ede2] hover:bg-[#f3ede2]/5"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(f.id)}
              onChange={() => toggle(f.id)}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="font-medium">{f.name}</span>
              {f.description && <span className="block text-xs text-[#f3ede2]/60">{f.description}</span>}
            </span>
            <span className="shrink-0 font-medium">
              ${(f.amountCents / 100).toFixed(2)}
              {f.type === "RECURRING_MONTHLY" ? "/mo" : ""}
            </span>
          </label>
        ))}
        {feeItems.length === 0 && !tuition && (
          <p className="text-sm text-[#f3ede2]/60">No fees are currently available to pay.</p>
        )}

        {tuition && (
          <label className="flex items-start gap-3 rounded-md border border-[#f3ede2]/20 p-3 text-sm text-[#f3ede2] hover:bg-[#f3ede2]/5">
            <input
              type="checkbox"
              checked={includeTuition}
              onChange={(e) => setIncludeTuition(e.target.checked)}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="font-medium">Monthly Tuition Autopay</span>
              <span className="block text-xs text-[#f3ede2]/60">
                From your Schedule and Financial Agreement.
              </span>
            </span>
            <span className="shrink-0 font-medium">${(tuition.monthlyAmountCents / 100).toFixed(2)}/mo</span>
          </label>
        )}
      </div>

      <div className="rounded-md border border-[#f3ede2]/20 p-3 text-sm text-[#f3ede2]">
        <div className="flex justify-between">
          <span>One-time due</span>
          <span>${(oneTimeDueCents / 100).toFixed(2)}</span>
        </div>
        {creditApplied > 0 && (
          <div className="flex justify-between text-[#f6c667]">
            <span>Credit applied</span>
            <span>-${(creditApplied / 100).toFixed(2)}</span>
          </div>
        )}
        {recurringTotalCents > 0 && (
          <div className="flex justify-between">
            <span>Monthly total</span>
            <span>${(recurringTotalCents / 100).toFixed(2)}/mo</span>
          </div>
        )}
      </div>

      <button
        onClick={checkout}
        disabled={busy || !hasSelection}
        className="w-full rounded-md bg-[#f6c667] px-4 py-2 text-sm font-medium text-[#241a5e] hover:bg-[#f6c667]/90 disabled:opacity-50"
      >
        {busy ? "Redirecting…" : "Checkout"}
      </button>
    </div>
  );
}
