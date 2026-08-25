"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

/** The persistent top-right cart — a badge + dropdown, not a separate page.
 * "Add to CART" buttons elsewhere (currently the Schedule and Financial
 * Agreement form) just push into this same client-side cart; checkout here
 * posts everything at once to /api/payments/cart-checkout. */
export function CartWidget() {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.lines.length === 0) return null;

  const oneTimeTotal = cart.lines
    .filter((l) => l.kind === "FEE_ITEM")
    .reduce((sum, l) => sum + l.amountCents, 0);
  const recurringTotal = cart.lines
    .filter((l) => l.kind === "TUITION")
    .reduce((sum, l) => sum + l.amountCents, 0);

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      const feeItemIds = cart.lines.filter((l) => l.kind === "FEE_ITEM").map((l) => l.feeItemId);
      const tuitionLine = cart.lines.find((l) => l.kind === "TUITION");

      const res = await fetch("/api/payments/cart-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeItemIds,
          includeTuition: !!tuitionLine,
          submissionId: tuitionLine?.submissionId,
          returnTo: window.location.pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        // Don't clear the cart here — checkout is only *initiated*, not
        // paid, at this point. If the parent abandons Stripe (no
        // "subscribe") and comes back, the cart must still be there. It's
        // cleared for real by CartProvider when a "?paid=1" success return
        // is detected.
        window.location.href = data.url;
      } else {
        setError(data.error ?? `Couldn't start checkout (HTTP ${res.status}).`);
      }
    } catch (err) {
      console.error("cart checkout failed", err);
      setError("Something went wrong starting checkout — check the browser console for details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative flex items-center gap-1 hover:text-[#f6c667] ${
          cart.disabledReason ? "text-[#f3ede2]/40" : "text-[#f3ede2]"
        }`}
        aria-label="Cart"
        title={cart.disabledReason ?? undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
          <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 5h13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
        </svg>
        {cart.lines.length > 0 && (
          <span
            className={`absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
              cart.disabledReason ? "bg-[#f3ede2]/40 text-[#241a5e]" : "bg-[#f6c667] text-[#241a5e]"
            }`}
          >
            {cart.lines.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border border-[#f3ede2]/20 bg-[#241a5e] p-4 normal-case text-[#f3ede2] shadow-xl">
            <p className="text-sm font-semibold">Cart</p>

            {cart.lines.length === 0 ? (
              <p className="mt-2 text-sm text-[#f3ede2]/60">Your cart is empty.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {cart.lines.map((line) => (
                  <li
                    key={line.kind === "FEE_ITEM" ? line.feeItemId : line.submissionId}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      {line.kind === "FEE_ITEM" ? line.name : "Monthly Tuition Autopay"}
                      {line.kind === "TUITION" && <span className="text-[#f3ede2]/50">/mo</span>}
                    </span>
                    <span className="flex items-center gap-2">
                      ${(line.amountCents / 100).toFixed(2)}
                      <button
                        onClick={() =>
                          line.kind === "FEE_ITEM" ? cart.removeFeeItem(line.feeItemId) : cart.removeTuition()
                        }
                        aria-label="Remove"
                        className="text-[#f3ede2]/50 hover:text-red-400"
                      >
                        &times;
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {cart.lines.length > 0 && (
              <div className="mt-3 space-y-1 border-t border-[#f3ede2]/10 pt-3 text-sm">
                {oneTimeTotal > 0 && (
                  <div className="flex justify-between">
                    <span>One-time</span>
                    <span>${(oneTimeTotal / 100).toFixed(2)}</span>
                  </div>
                )}
                {recurringTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Monthly</span>
                    <span>${(recurringTotal / 100).toFixed(2)}/mo</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#f3ede2]/10 pt-1 font-semibold">
                  <span>Total</span>
                  <span>
                    {oneTimeTotal > 0 && `$${(oneTimeTotal / 100).toFixed(2)}`}
                    {oneTimeTotal > 0 && recurringTotal > 0 && " + "}
                    {recurringTotal > 0 && `$${(recurringTotal / 100).toFixed(2)}/mo`}
                  </span>
                </div>
              </div>
            )}

            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            {cart.disabledReason && (
              <p className="mt-2 text-xs text-[#f6c667]">{cart.disabledReason}</p>
            )}

            <button
              onClick={checkout}
              disabled={busy || cart.lines.length === 0 || !!cart.disabledReason}
              className="mt-3 w-full rounded-md bg-[#f6c667] px-3 py-2 text-sm font-medium text-[#241a5e] hover:bg-[#f6c667]/90 disabled:opacity-50"
            >
              {busy ? "Redirecting…" : "Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
