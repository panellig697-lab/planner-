"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { SCHEMAS, type EntityType } from "@/lib/schema";
import type { AppState } from "@/lib/types";

// Entity types with somewhere to actually land on click. Events dropped out
// of the nav with the Calendar tab — there's nowhere to send a click on an
// event result anymore, so it's excluded here rather than being a dead end.
const SEARCHABLE: EntityType[] = ["people", "companies", "projects", "tasks", "ideas", "knowledge", "creative"];

// Text-ish field types worth substring-matching against.
const TEXT_FIELD_TYPES = new Set(["title", "text", "email", "phone", "url"]);

export interface SearchResult {
  type: EntityType;
  id: string;
  title: string;
  subtitle?: string;
}

function searchState(state: AppState, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const type of SEARCHABLE) {
    const schema = SCHEMAS[type];
    const textFields = schema.fields.filter((f) => TEXT_FIELD_TYPES.has(f.type));
    const rows = state[type] as unknown as Record<string, unknown>[];
    let count = 0;
    for (const row of rows) {
      if (count >= 5) break; // cap per type so one huge table can't drown out the rest
      const haystack = textFields
        .map((f) => row[f.key])
        .filter((v) => typeof v === "string")
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) continue;
      const title = String(row[schema.titleField] || "Untitled");
      const subtitleField = schema.fields.find((f) => f.type === "select");
      results.push({
        type,
        id: row.id as string,
        title,
        subtitle: subtitleField ? (row[subtitleField.key] as string | undefined) : undefined,
      });
      count++;
    }
  }
  return results;
}

export default function GlobalSearch({
  state,
  onSelect,
}: {
  state: AppState;
  onSelect: (result: SearchResult) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchState(state, query), [state, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper-dark hover:text-ink"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm" onClick={close}>
      <div
        className="mx-auto mt-[calc(12px+env(safe-area-inset-top))] w-full max-w-3xl px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card animate-fade-in overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-ink-soft" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, companies, projects, tasks…"
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
            />
            <button onClick={close} aria-label="Close search" className="shrink-0 text-ink-soft hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() === "" ? (
              <p className="px-3.5 py-6 text-center text-sm text-ink-soft/70">
                Search across your whole Second Brain — not just this tab.
              </p>
            ) : results.length === 0 ? (
              <p className="px-3.5 py-6 text-center text-sm text-ink-soft/70">No matches for "{query}".</p>
            ) : (
              <ul>
                {results.map((r) => (
                  <li key={`${r.type}-${r.id}`}>
                    <button
                      onClick={() => {
                        onSelect(r);
                        close();
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition hover:bg-paper-dark"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                        {r.subtitle && <p className="text-xs text-ink-soft">{r.subtitle}</p>}
                      </div>
                      <span className="shrink-0 rounded-full border border-line bg-paper-dark px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                        {SCHEMAS[r.type].singular}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

