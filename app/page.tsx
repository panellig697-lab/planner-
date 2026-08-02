"use client";

import { useState } from "react";
import { useAppState } from "@/lib/useAppState";
import CommandCentre from "@/components/CommandCentre";
import BusinessOverview from "@/components/BusinessOverview";
import CalendarView from "@/components/CalendarView";
import Explorer from "@/components/Explorer";
import QuickCapture from "@/components/QuickCapture";

const TABS = [
  { key: "today", label: "Today" },
  { key: "business", label: "Business" },
  { key: "calendar", label: "Calendar" },
  { key: "explorer", label: "Explorer" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Page() {
  const [tab, setTab] = useState<TabKey>("today");
  const { state, loading, error, mutate, refresh } = useAppState();

  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 pt-[calc(14px+env(safe-area-inset-top))]">
          <div className="flex items-baseline justify-between pb-3">
            <h1 className="font-serif text-xl font-semibold tracking-tight text-ink">
              Gio Second Brain
            </h1>
            <span className="label-caps">
              {loading ? "syncing…" : error ? "offline" : "live"}
            </span>
          </div>
          <nav className="flex gap-1 pb-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                  tab === t.key
                    ? "border-rust text-ink font-semibold"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        {error && (
          <div className="card mb-4 border-rust/40 px-4 py-3 text-sm text-rust-dark">
            {error}
          </div>
        )}
        {tab === "today" && <CommandCentre state={state} mutate={mutate} />}
        {tab === "business" && <BusinessOverview state={state} mutate={mutate} />}
        {tab === "calendar" && <CalendarView state={state} />}
        {tab === "explorer" && <Explorer state={state} mutate={mutate} />}
      </main>

      <QuickCapture onCaptured={refresh} />
    </div>
  );
}
