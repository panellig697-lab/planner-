"use client";

import { useState } from "react";
import { Sun, Briefcase, Repeat, Bot, Palette, Contact, Circle } from "lucide-react";
import { useAppState } from "@/lib/useAppState";
import CommandCentre from "@/components/CommandCentre";
import BusinessOverview from "@/components/BusinessOverview";
import BusinessAreaWorkspace from "@/components/BusinessAreaWorkspace";
import CreativeWorkspace from "@/components/CreativeWorkspace";
import ContactsView from "@/components/ContactsView";
import QuickCapture from "@/components/QuickCapture";
import GlobalSearch, { type SearchResult } from "@/components/GlobalSearch";

// Retainr and Clario aren't separate databases — each is one row in
// Companies (matched by exact name) plus the shared "Area" tag on
// Projects/Companies. BusinessAreaWorkspace merges both signals; see that
// component for why a pure company-relation view isn't enough on its own.
const TABS = [
  { key: "today", label: "Today", icon: Sun },
  { key: "business", label: "Business", icon: Briefcase },
  { key: "retainr", label: "Retainr", icon: Repeat },
  { key: "clario", label: "Clario", icon: Bot },
  { key: "creative", label: "Creative", icon: Palette },
  { key: "contacts", label: "Contacts", icon: Contact },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Page() {
  const [tab, setTab] = useState<TabKey>("today");
  const { state, loading, error, mutate, refresh } = useAppState();
  const [focusPersonId, setFocusPersonId] = useState<{ id: string; nonce: number } | null>(null);
  const [focusCompanyId, setFocusCompanyId] = useState<{ id: string; nonce: number } | null>(null);

  function handleSearchSelect(result: SearchResult) {
    const nonce = Date.now();
    switch (result.type) {
      case "people":
        setTab("contacts");
        setFocusPersonId({ id: result.id, nonce });
        break;
      case "companies":
        setTab("business");
        setFocusCompanyId({ id: result.id, nonce });
        break;
      case "creative":
        setTab("creative");
        break;
      // projects/tasks/ideas/knowledge don't have a single-item deep link
      // yet — landing on Business's card grid (where each of those lives)
      // is a reasonable, simple stop short of plumbing a focus id through
      // every one of BusinessOverview's sub-sections for a first version.
      default:
        setTab("business");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 pt-[calc(14px+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between pb-3">
            <h1 className="text-[15px] font-semibold tracking-tight text-ink">Gio Second Brain</h1>
            <div className="flex items-center gap-1">
              <GlobalSearch state={state} onSelect={handleSearchSelect} />
              <span className="label-caps flex items-center gap-1.5">
                <Circle
                  className={`h-2 w-2 ${
                    loading ? "fill-ink-soft text-ink-soft" : error ? "fill-rust text-rust" : "fill-emerald-500 text-emerald-500"
                  }`}
                />
                {loading ? "syncing" : error ? "offline" : "live"}
              </span>
            </div>
          </div>
          {/* Horizontally scrollable, not a fixed grid — 6 tabs don't
              comfortably fit an iPhone-width screen without either cutting
              labels off or shrinking them unreadably, and this pattern was
              already proven in this codebase (Explorer's old tab bar). */}
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
        {tab === "business" && (
          <BusinessOverview
            state={state}
            mutate={mutate}
            loading={loading}
            focusCompanyId={focusCompanyId}
          />
        )}
        {tab === "retainr" && (
          <BusinessAreaWorkspace
            label="Retainr"
            companyName="Retainr"
            areaValue="Retainr"
            icon={Repeat}
            state={state}
            mutate={mutate}
            loading={loading}
          />
        )}
        {tab === "clario" && (
          <BusinessAreaWorkspace
            label="Clario"
            companyName="Clario"
            areaValue="Clario"
            icon={Bot}
            state={state}
            mutate={mutate}
            loading={loading}
          />
        )}
        {tab === "creative" && <CreativeWorkspace state={state} mutate={mutate} loading={loading} />}
        {tab === "contacts" && (
          <ContactsView state={state} mutate={mutate} loading={loading} focusPersonId={focusPersonId} />
        )}
      </main>

      <QuickCapture onCaptured={refresh} />
    </div>
  );
}
