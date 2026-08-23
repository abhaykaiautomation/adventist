"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface KbDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export function KnowledgeBaseManager({ initialDocs }: { initialDocs: KbDoc[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function addDoc() {
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not save.");
        return;
      }
      setTitle("");
      setContent("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/knowledge-base/${id}`, { method: "DELETE" });
      setDocs((d) => d.filter((doc) => doc.id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-md border bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-800">Add content</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. 'Lunch Menu — Fall 2025')"
          className="mt-2 w-full rounded-md border p-2 text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the FAQ answer, policy excerpt, or instruction text…"
          rows={5}
          className="mt-2 w-full rounded-md border p-2 text-sm"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={addDoc}
          disabled={busy || !title.trim() || !content.trim()}
          className="mt-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Embed &amp; Save
        </button>
      </div>

      <ul className="space-y-2">
        {docs.map((d) => (
          <li key={d.id} className="rounded-md border bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-800">{d.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{d.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Updated {new Date(d.updatedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => remove(d.id)}
                disabled={busy}
                className="shrink-0 text-sm text-red-700 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {docs.length === 0 && (
          <li className="rounded-md border bg-white p-4 text-sm text-gray-500">
            No knowledge base content yet.
          </li>
        )}
      </ul>
    </div>
  );
}
