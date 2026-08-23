"use client";

import { useState } from "react";

export interface FieldQuestionData {
  id: string;
  fieldKey: string;
  question: string;
  answer: string | null;
  status: "OPEN" | "ANSWERED" | "RESOLVED" | "WITHDRAWN";
}

export function FieldQuestionPopover({
  submissionId,
  fieldKey,
  questions,
  onChanged,
}: {
  submissionId: string | null;
  fieldKey: string;
  questions: FieldQuestionData[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const hasOpen = questions.some((q) => q.status === "OPEN");

  async function ask() {
    if (!submissionId || !draft.trim()) return;
    setBusy(true);
    try {
      await fetch(`/api/submissions/${submissionId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldKey, question: draft.trim() }),
      });
      setDraft("");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function withdraw(questionId: string) {
    setBusy(true);
    try {
      await fetch(`/api/submissions/${submissionId}/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function resolve(questionId: string) {
    setBusy(true);
    try {
      await fetch(`/api/submissions/${submissionId}/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve" }),
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        title={submissionId ? "Ask a question" : "Save as draft first to ask a question"}
        disabled={!submissionId}
        onClick={() => setOpen((o) => !o)}
        className={`ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
          hasOpen ? "bg-amber-400 text-amber-950" : "bg-gray-200 text-gray-600"
        } disabled:opacity-40`}
      >
        ?
      </button>

      {open && (
        <div className="absolute left-0 top-6 z-20 w-72 rounded-md border bg-white p-3 shadow-lg">
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {questions.length === 0 && (
              <p className="text-xs text-gray-500">No questions on this field yet.</p>
            )}
            {questions.map((q) => (
              <div key={q.id} className="rounded bg-gray-50 p-2 text-xs">
                <p className="font-medium text-gray-800">You: {q.question}</p>
                {q.answer && <p className="mt-1 text-gray-700">Admin: {q.answer}</p>}
                <p className="mt-1 text-[10px] uppercase text-gray-400">{q.status}</p>
                {q.status === "OPEN" && (
                  <button onClick={() => withdraw(q.id)} disabled={busy} className="mt-1 text-blue-700 hover:underline">
                    Withdraw
                  </button>
                )}
                {q.status === "ANSWERED" && (
                  <button onClick={() => resolve(q.id)} disabled={busy} className="mt-1 text-blue-700 hover:underline">
                    Mark resolved
                  </button>
                )}
              </div>
            ))}
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask the school office about this field…"
            className="mt-2 w-full rounded border p-1.5 text-xs"
            rows={2}
          />
          <button
            onClick={ask}
            disabled={busy || !draft.trim()}
            className="mt-1 w-full rounded bg-blue-700 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      )}
    </span>
  );
}
