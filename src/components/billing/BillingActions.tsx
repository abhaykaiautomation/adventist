"use client";

import { useState } from "react";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED" | null;

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.error ?? "Something went wrong");
  }
}

export function BillingActions({
  applicationFeeStatus,
  submissionId,
  monthlyAmount,
  tuitionStatus,
  hasBillingAccount,
}: {
  applicationFeeStatus: PaymentStatus;
  submissionId: string | null;
  monthlyAmount: number | null;
  tuitionStatus: PaymentStatus;
  hasBillingAccount: boolean;
}) {
  const [busy, setBusy] = useState<"fee" | "tuition" | "portal" | null>(null);

  async function run(key: "fee" | "tuition" | "portal", action: () => Promise<void>) {
    setBusy(key);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#f3ede2]/20 p-4">
        <h2 className="font-medium text-[#f3ede2]">Application Fee</h2>
        <p className="mt-1 text-sm text-[#f3ede2]/70">
          {applicationFeeStatus === "PAID"
            ? "Paid — thank you!"
            : applicationFeeStatus === "PENDING"
              ? "Payment in progress — this updates once Stripe confirms it."
              : "A one-time enrollment application fee."}
        </p>
        {applicationFeeStatus !== "PAID" && (
          <button
            onClick={() => run("fee", () => postJson("/api/payments/checkout", { type: "APPLICATION_FEE" }))}
            disabled={busy !== null}
            className="mt-3 rounded-md bg-[#f6c667] px-4 py-2 text-sm font-medium text-[#241a5e] hover:bg-[#f6c667]/90 disabled:opacity-50"
          >
            {busy === "fee" ? "Redirecting…" : "Pay Application Fee"}
          </button>
        )}
      </div>

      <div className="rounded-lg border border-[#f3ede2]/20 p-4">
        <h2 className="font-medium text-[#f3ede2]">Monthly Tuition</h2>
        {!submissionId || !monthlyAmount ? (
          <p className="mt-1 text-sm text-[#f3ede2]/70">
            Complete the Schedule and Financial Agreement form first — your monthly rate comes from there.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[#f3ede2]/70">
              {tuitionStatus === "PAID"
                ? `Active — $${monthlyAmount.toFixed(2)}/month.`
                : tuitionStatus === "CANCELED"
                  ? "Billing was canceled. You can set it up again below."
                  : tuitionStatus === "FAILED"
                    ? "Last payment failed — please update your card via Manage Billing below."
                    : `$${monthlyAmount.toFixed(2)}/month, based on your Schedule and Financial Agreement.`}
            </p>
            {tuitionStatus !== "PAID" && (
              <button
                onClick={() =>
                  run("tuition", () => postJson("/api/payments/checkout", { type: "TUITION", submissionId }))
                }
                disabled={busy !== null}
                className="mt-3 rounded-md bg-[#f6c667] px-4 py-2 text-sm font-medium text-[#241a5e] hover:bg-[#f6c667]/90 disabled:opacity-50"
              >
                {busy === "tuition" ? "Redirecting…" : "Set Up Monthly Billing"}
              </button>
            )}
          </>
        )}
      </div>

      {hasBillingAccount && (
        <button
          onClick={() => run("portal", () => postJson("/api/payments/portal"))}
          disabled={busy !== null}
          className="text-sm text-[#f6c667] hover:underline disabled:opacity-50"
        >
          {busy === "portal" ? "Redirecting…" : "Manage Billing (update card / cancel) →"}
        </button>
      )}
    </div>
  );
}
