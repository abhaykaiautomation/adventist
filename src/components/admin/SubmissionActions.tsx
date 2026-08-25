"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmissionActions({
  submissionId,
  fieldKeys,
}: {
  submissionId: string;
  fieldKeys: string[];
}) {
  const router = useRouter();
  const [fieldKey, setFieldKey] = useState(fieldKeys[0] ?? "");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function setStatus(status: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function requestChanges() {
    if (!fieldKey || !comment.trim()) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/submissions/${submissionId}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldKey, comment: comment.trim() }),
      });
      setComment("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatus("UNDER_REVIEW")}
          disabled={busy}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Mark Under Review
        </button>
        <button
          onClick={() => setStatus("APPROVED")}
          disabled={busy}
          className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => setStatus("REJECTED")}
          disabled={busy}
          className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-800">Request a correction on a field</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <select
            value={fieldKey}
            onChange={(e) => setFieldKey(e.target.value)}
            className="rounded-md border border-gray-300 p-2 text-sm sm:w-56"
          >
            {fieldKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Please re-upload a clearer photo of the birth certificate"
            className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
          />
          <button
            onClick={requestChanges}
            disabled={busy || !comment.trim()}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Send &amp; Flag Needs Changes
          </button>
        </div>
      </div>
    </div>
  );
}
