"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface FeeItemData {
  id: string;
  name: string;
  description: string | null;
  amountCents: number;
  type: "ONE_TIME" | "RECURRING_MONTHLY";
  isActive: boolean;
  sortOrder: number;
}

/** Two modes in one component: no `feeItem` prop renders the "add new" form;
 * passing one renders that row with an inline edit toggle and an
 * active/inactive toggle — mirrors StaffActions.tsx's add-vs-revoke split. */
export function FeeItemActions({ feeItem }: { feeItem?: FeeItemData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(feeItem?.name ?? "");
  const [description, setDescription] = useState(feeItem?.description ?? "");
  const [amount, setAmount] = useState(feeItem ? (feeItem.amountCents / 100).toFixed(2) : "");
  const [type, setType] = useState<"ONE_TIME" | "RECURRING_MONTHLY">(feeItem?.type ?? "ONE_TIME");
  const [sortOrder, setSortOrder] = useState(feeItem ? String(feeItem.sortOrder) : "0");

  async function submitNew() {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!name.trim() || !amountCents) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          amountCents,
          type,
          sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong");
        return;
      }
      setName("");
      setDescription("");
      setAmount("");
      setType("ONE_TIME");
      setSortOrder("0");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function submitEdit() {
    if (!feeItem) return;
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!name.trim() || !amountCents) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/fees/${feeItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          amountCents,
          type,
          sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    if (!feeItem) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/fees/${feeItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !feeItem.isActive }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!feeItem) {
    return (
      <div>
        <p className="text-sm font-medium text-gray-800">Add a fee item</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Registration for New Students"
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 sm:col-span-2"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 sm:col-span-2"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            min="0.50"
            placeholder="Amount ($)"
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "ONE_TIME" | "RECURRING_MONTHLY")}
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
          >
            <option value="ONE_TIME">One-time</option>
            <option value="RECURRING_MONTHLY">Recurring monthly</option>
          </select>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            type="number"
            placeholder="Sort order"
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
          />
          <button
            onClick={submitNew}
            disabled={busy || !name.trim() || !amount}
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            Add Fee
          </button>
        </div>
        {message && <p className="mt-2 text-xs text-gray-600">{message}</p>}
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 sm:col-span-2"
          />
          <input
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 sm:col-span-2"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            min="0.50"
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "ONE_TIME" | "RECURRING_MONTHLY")}
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
          >
            <option value="ONE_TIME">One-time</option>
            <option value="RECURRING_MONTHLY">Recurring monthly</option>
          </select>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            type="number"
            className="rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={submitEdit}
            disabled={busy}
            className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            disabled={busy}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        {message && <p className="mt-2 text-xs text-gray-600">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-gray-800">
          {feeItem.name} — ${(feeItem.amountCents / 100).toFixed(2)}
          {feeItem.type === "RECURRING_MONTHLY" ? "/mo" : ""}
        </p>
        {feeItem.description && <p className="text-xs text-gray-500">{feeItem.description}</p>}
        <p className="mt-1 flex items-center gap-2 text-xs text-gray-400">
          <StatusBadge status={feeItem.isActive ? "ACTIVE" : "REVOKED"} />
          {feeItem.type === "RECURRING_MONTHLY" ? "Recurring monthly" : "One-time"}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setEditing(true)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={toggleActive}
          disabled={busy}
          className={`rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 ${
            feeItem.isActive
              ? "border-red-300 text-red-700 hover:bg-red-50"
              : "border-green-300 text-green-700 hover:bg-green-50"
          }`}
        >
          {feeItem.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}
