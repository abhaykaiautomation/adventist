"use client";

import { useState } from "react";

export function ShareWithPhysician({ submissionId }: { submissionId: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function share() {
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create share link.");
        return;
      }
      setLink(data.url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-sm font-semibold text-blue-950">Share remaining sections with physician</h2>
      <p className="mt-1 text-xs text-blue-900">
        Your part is done and signed. Enter your physician&apos;s email — they&apos;ll get a
        scoped link to complete the rest, no account required. The link expires in 14 days.
      </p>

      {link ? (
        <div className="mt-3 rounded-md border bg-white p-3">
          <p className="text-xs text-gray-600">
            Share this link with your physician&apos;s office (email delivery isn&apos;t wired
            up yet — copy and send it yourself for now):
          </p>
          <p className="mt-1 break-all text-sm font-mono text-blue-800">{link}</p>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="physician@example.com"
            className="flex-1 rounded-md border p-2 text-sm"
          />
          <button
            onClick={share}
            disabled={busy || !email.trim()}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Generate Link
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
