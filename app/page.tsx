"use client";

import { useState } from "react";
import { Sun, Briefcase, CalendarDays, Compass, Contact, Circle } from "lucide-react";
import { useAppState } from "@/lib/useAppState";
import CommandCentre from "@/components/CommandCentre";
import BusinessOverview from "@/components/BusinessOverview";
import CalendarView from "@/components/CalendarView";
import Explorer from "@/components/Explorer";
import ContactsView from "@/components/ContactsView";
import QuickCapture from "@/components/QuickCapture";

const TABS = [
  { key: "today", label: "Today", icon: Sun },
  { key: "business", label: "Business", icon: Briefcase },
  { key: "contacts", label: "Contacts", icon: Contact },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "explorer", label: "Explorer", icon: Compass },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Page() {
  const [tab, setTab] = useState<TabKey>("today");
  const { state, loading, error, mutate, refresh } = useAppState();

  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 pt-[calc(14px+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between pb-3">
            <h1 className="text-[15px] font-semibold tracking-tight text-ink">Gio Second Brain</h1>
            <span className="label-caps flex items-center gap-1.5">
              <Circle
                className={`h-2 w-2 ${
                  loading ? "fill-ink-soft text-ink-soft" : error ? "fill-rust text-rust" : "fill-emerald-500 text-emerald-500"
                }`}
              />
              {loading ? "syncing" : error ? "offline" : "live"}
            </span>
          </div>
          <nav className="flex gap-0.5 overflow-x-auto pb-2 scrollbar-thin">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.key
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper-dark hover:text-ink"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" strokeWidth={2} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        {error && (
          <div role="alert" className="card mb-4 border-rust/40 px-4 py-3 text-sm text-rust-dark animate-fade-in">
            {error}
          </div>
        )}
        {tab === "today" && <CommandCentre state={state} mutate={mutate} loading={loading} />}
        {tab === "business" && <BusinessOverview state={state} mutate={mutate} loading={loading} />}
        {tab === "contacts" && <ContactsView state={state} mutate={mutate} loading={loading} />}
        {tab === "calendar" && <CalendarView state={state} />}
        {tab === "explorer" && <Explorer state={state} mutate={mutate} loading={loading} />}
      </main>

      <QuickCapture onCaptured={refresh} />
    </div>
  );
}
