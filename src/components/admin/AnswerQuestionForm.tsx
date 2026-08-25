"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AnswerQuestionForm({ submissionId, questionId }: { submissionId: string; questionId: string }) {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!answer.trim()) return;
    setBusy(true);
    try {
      await fetch(`/api/submissions/${submissionId}/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answer", answer: answer.trim() }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer…"
        className="flex-1 rounded-md border p-1.5 text-sm"
      />
      <button
        onClick={submit}
        disabled={busy || !answer.trim()}
        className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
      >
        Answer
      </button>
    </div>
  );
}
