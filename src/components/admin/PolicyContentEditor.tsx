"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PolicyContentEditor({
  policyId,
  initialContentHtml,
}: {
  policyId: string;
  initialContentHtml: string;
}) {
  const [contentHtml, setContentHtml] = useState(initialContentHtml);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/policies/${policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentHtml }),
      });
      if (!res.ok) {
        const data = await res.json();
        setBanner(data.error ?? "Could not save.");
        return;
      }
      setBanner("Saved — parents will see this the next time they open the page.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
        <textarea
          value={contentHtml}
          onChange={(e) => setContentHtml(e.target.value)}
          rows={24}
          className="mt-1 w-full rounded-md border border-gray-300 p-3 font-mono text-xs"
        />

        {banner && <p className="mt-2 text-sm text-blue-700">{banner}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="mt-3 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700">Live Preview</p>
        <article
          className="prose prose-sm mt-1 max-w-none rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </div>
  );
}
