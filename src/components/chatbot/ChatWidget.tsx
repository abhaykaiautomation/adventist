"use client";

import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function ChatWidget({ formTemplateId, formName }: { formTemplateId?: string; formName?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    const question = input.trim();
    if (!question) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, formTemplateId, formName }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: res.ok ? data.answer : (data.error ?? "Something went wrong.") },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="flex h-96 w-80 flex-col rounded-lg border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b p-3">
            <p className="text-sm font-semibold text-blue-950">Ask about this form</p>
            <button onClick={() => setOpen(false)} className="text-gray-500">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {messages.length === 0 && (
              <p className="text-gray-500">
                Ask me about instructions, eligibility, or documents for this form — I can only
                answer from the school&apos;s handbook and FAQ content.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-md p-2 ${m.role === "user" ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-800"}`}
              >
                {m.text}
              </div>
            ))}
            {busy && <p className="text-gray-400">Thinking…</p>}
          </div>

          <div className="flex gap-2 border-t p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="Type a question…"
              className="flex-1 rounded-md border p-2 text-sm"
            />
            <button
              onClick={ask}
              disabled={busy || !input.trim()}
              className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-800"
        >
          💬 Help
        </button>
      )}
    </div>
  );
}
