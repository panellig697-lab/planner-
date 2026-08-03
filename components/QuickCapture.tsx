"use client";

import { useState } from "react";
import { ArrowUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto max-w-3xl px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5">
        {feedback && (
          <p
            role="status"
            className={`mb-1.5 flex items-center gap-1.5 text-xs animate-fade-in ${
              feedback.kind === "ok" ? "text-ink-soft" : "text-rust-dark"
            }`}
          >
            {feedback.kind === "ok" ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            )}
            {feedback.text}
          </p>
        )}
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Capture a thought, task, or contact…"
            className="flex-1 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink shadow-soft outline-none transition placeholder:text-ink-soft/70 focus:border-rust/50"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            aria-label="Capture"
            className="flex shrink-0 items-center justify-center rounded-xl bg-rust p-2.5 text-paper shadow-soft transition hover:opacity-90 disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
