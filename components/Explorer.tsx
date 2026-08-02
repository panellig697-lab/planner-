"use client";

import { useState } from "react";
import { SCHEMAS, type EntityType } from "@/lib/schema";
import type { AppState } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import EntityForm from "./EntityForm";
import { formatGBP } from "@/lib/format";

const TABS: EntityType[] = ["people", "companies", "projects", "tasks", "ideas", "knowledge"];

export default function Explorer({
  state,
  mutate,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
}) {
  const [tab, setTab] = useState<EntityType>("people");
  const [editing, setEditing] = useState<string | null>(null); // row id, or "new"

  const schema = SCHEMAS[tab];
  const rows = state[tab] as unknown as Record<string, unknown>[];

  function selectTab(t: EntityType) {
    setTab(t);
    setEditing(null);
  }

  return (
    <div>
      <div className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => selectTab(t)}
            className={`shrink-0 rounded-sm px-3 py-1.5 text-sm ${
              tab === t ? "bg-ink text-paper" : "border border-line text-ink-soft"
            }`}
          >
            {SCHEMAS[t].label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="label-caps">{rows.length} {schema.label.toLowerCase()}</span>
        {editing !== "new" && (
          <button
            onClick={() => setEditing("new")}
            className="rounded-sm bg-rust px-3 py-1 text-sm font-medium text-paper"
          >
            + Add {schema.singular}
          </button>
        )}
      </div>

      {editing === "new" && (
        <div className="mb-4">
          <EntityForm schema={schema} state={state} onDone={() => setEditing(null)} mutate={mutate} />
        </div>
      )}

      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id as string}>
            {editing === row.id ? (
              <EntityForm
                schema={schema}
                state={state}
                initial={row}
                onDone={() => setEditing(null)}
                mutate={mutate}
              />
            ) : (
              <button
                onClick={() => setEditing(row.id as string)}
                className="card block w-full px-3 py-2.5 text-left"
              >
                <RowSummary schema={schema} row={row} />
              </button>
            )}
          </li>
        ))}
        {rows.length === 0 && editing !== "new" && (
          <p className="text-sm italic text-ink-soft">Nothing here yet.</p>
        )}
      </ul>
    </div>
  );
}

function RowSummary({ schema, row }: { schema: (typeof SCHEMAS)[EntityType]; row: Record<string, unknown> }) {
  const title = String(row[schema.titleField] ?? "Untitled");
  const badgeField = schema.fields.find((f) => f.type === "select");
  const badge = badgeField ? (row[badgeField.key] as string | null) : null;
  const numberField = schema.fields.find((f) => f.type === "number" && f.currency);
  const amount = numberField ? (row[numberField.key] as number | null) : null;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="min-w-0 truncate text-sm font-medium text-ink">{title}</p>
      <div className="flex shrink-0 items-center gap-2 text-xs text-ink-soft">
        {amount !== null && amount !== undefined && (
          <span className="font-mono text-rust-dark">{formatGBP(amount)}</span>
        )}
        {badge && (
          <span className="rounded-sm border border-line bg-paper-dark px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
