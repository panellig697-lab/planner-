"use client";

import { useState } from "react";

export default function QuickCapture({ onCaptured }: { onCaptured: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Capture failed");
      setFeedback({ kind: "ok", text: data.summary ?? "Captured." });
      setText("");
      onCaptured();
    } catch (err: any) {
      setFeedback({ kind: "error", text: err?.message ?? "Capture failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5">
        {feedback && (
          <p
            className={`mb-1.5 text-xs ${
              feedback.kind === "ok" ? "text-ink-soft" : "text-rust-dark"
            }`}
          >
            {feedback.kind === "ok" ? "✓ " : "! "}
            {feedback.text}
          </p>
        )}
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Capture a thought, task, or contact…"
            className="flex-1 rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="shrink-0 rounded-sm bg-rust px-3 py-2 text-sm font-medium text-paper disabled:opacity-50"
          >
            {busy ? "…" : "Capture"}
          </button>
        </form>
      </div>
    </div>
  );
}
