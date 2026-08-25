"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface CartFeeLine {
  kind: "FEE_ITEM";
  feeItemId: string;
  name: string;
  amountCents: number;
}

interface CartTuitionLine {
  kind: "TUITION";
  submissionId: string;
  amountCents: number;
}

export type CartLine = CartFeeLine | CartTuitionLine;

interface CartContextValue {
  lines: CartLine[];
  hasFeeItem: (feeItemId: string) => boolean;
  addFeeItem: (feeItemId: string, name: string, amountCents: number) => void;
  removeFeeItem: (feeItemId: string) => void;
  hasTuition: (submissionId: string) => boolean;
  setTuition: (submissionId: string, amountCents: number) => void;
  removeTuition: () => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "cart:v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Starts empty on the server (and on first client render) to avoid a
  // hydration mismatch, then hydrates from localStorage right after mount —
  // this is per-browser state, never sent to or trusted by the server; the
  // checkout API re-validates every fee item and the tuition amount itself.
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    // Deliberately reading an external store (localStorage, unavailable
    // during SSR) after mount, not synchronizing React state to itself —
    // starting both the server render and this first client render empty
    // is what avoids a hydration mismatch here.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // Ignore a corrupt/blocked localStorage — just start with an empty cart.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage may be unavailable (private mode, quota) — cart just won't persist.
    }
  }, [lines]);

  const hasFeeItem = useCallback(
    (feeItemId: string) => lines.some((l) => l.kind === "FEE_ITEM" && l.feeItemId === feeItemId),
    [lines]
  );

  const addFeeItem = useCallback((feeItemId: string, name: string, amountCents: number) => {
    setLines((prev) =>
      prev.some((l) => l.kind === "FEE_ITEM" && l.feeItemId === feeItemId)
        ? prev
        : [...prev, { kind: "FEE_ITEM", feeItemId, name, amountCents }]
    );
  }, []);

  const removeFeeItem = useCallback((feeItemId: string) => {
    setLines((prev) => prev.filter((l) => !(l.kind === "FEE_ITEM" && l.feeItemId === feeItemId)));
  }, []);

  const hasTuition = useCallback(
    (submissionId: string) => lines.some((l) => l.kind === "TUITION" && l.submissionId === submissionId),
    [lines]
  );

  const setTuition = useCallback((submissionId: string, amountCents: number) => {
    setLines((prev) => [
      ...prev.filter((l) => l.kind !== "TUITION"),
      { kind: "TUITION", submissionId, amountCents },
    ]);
  }, []);

  const removeTuition = useCallback(() => {
    setLines((prev) => prev.filter((l) => l.kind !== "TUITION"));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, hasFeeItem, addFeeItem, removeFeeItem, hasTuition, setTuition, removeTuition, clear }),
    [lines, hasFeeItem, addFeeItem, removeFeeItem, hasTuition, setTuition, removeTuition, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
