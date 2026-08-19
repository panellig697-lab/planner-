"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { EntitySchema } from "@/lib/schema";
import type { AppState } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import EntityForm from "./EntityForm";
import { formatGBP } from "@/lib/format";
import { SkeletonList } from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";

/**
 * Generic "list of one entity type, with inline add/edit" — the reusable
 * core Explorer used to keep behind a tab bar. Extracted so any workspace
 * (Business's Ideas/Knowledge cards, Creative's sections) can drop in a
 * schema-driven CRUD list without a second copy of this logic — the tab
 * bar was the only Explorer-specific part, and every workspace that needs
 * this now supplies its own pre-filtered `rows` instead.
 */
export default function EntityList({
  schema,
  rows,
  state,
  mutate,
  loading,
  icon: Icon,
  emptyTitle,
  emptyDescription = "Add your first one to get started.",
  addLabel,
  newDefaults,
  onRowClick,
}: {
  schema: EntitySchema;
  rows: Record<string, unknown>[];
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  loading: boolean;
  icon: typeof Plus;
  emptyTitle?: string;
  emptyDescription?: string;
  addLabel?: string;
  newDefaults?: Record<string, unknown>;
  onRowClick?: (row: Record<string, unknown>) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null); // row id, or "new"

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="label-caps">
          {rows.length} {schema.label.toLowerCase()}
        </span>
        {editing !== "new" && (
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1 rounded-lg bg-rust px-3 py-1.5 text-sm font-medium text-paper shadow-soft transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> {addLabel ?? `Add ${schema.singular}`}
          </button>
        )}
      </div>

      {editing === "new" && (
        <div className="mb-4">
          <EntityForm
            schema={schema}
            state={state}
            initial={newDefaults}
            onDone={() => setEditing(null)}
            mutate={mutate}
          />
        </div>
      )}

      {loading && rows.length === 0 ? (
        <SkeletonList rows={5} />
      ) : rows.length === 0 && editing !== "new" ? (
        <EmptyState
          icon={Icon}
          title={emptyTitle ?? `No ${schema.label.toLowerCase()} yet`}
          description={emptyDescription}
        />
      ) : (
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
                  onClick={() => (onRowClick ? onRowClick(row) : setEditing(row.id as string))}
                  className="card block w-full px-3.5 py-3 text-left animate-fade-in"
                >
                  <RowSummary schema={schema} row={row} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RowSummary({ schema, row }: { schema: EntitySchema; row: Record<string, unknown> }) {
  // `||`, not `??`: a Notion title property with no text comes back as ""
  // (not null/undefined), so `?? "Untitled"` never caught it — the row
  // rendered as a real, clickable, but blank list item that looked like it
  // was simply missing. `||` also falls back on that empty string.
  const title = String(row[schema.titleField] || "Untitled");
  const badgeField = schema.fields.find((f) => f.type === "select");
  const badge = badgeField ? (row[badgeField.key] as string | null) : null;
  const numberField = schema.fields.find((f) => f.type === "number" && f.currency);
  const amount = numberField ? (row[numberField.key] as number | null) : null;
  const featured = schema.fields.some((f) => f.type === "checkbox" && f.key === "featured") && Boolean(row.featured);

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="min-w-0 truncate text-sm font-medium text-ink">
        {featured && "★ "}
        {title}
      </p>
      <div className="flex shrink-0 items-center gap-2 text-xs text-ink-soft">
        {amount !== null && amount !== undefined && (
          <span className="font-mono text-rust-dark">{formatGBP(amount)}</span>
        )}
        {badge && (
          <span className="rounded-full border border-line bg-paper-dark px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
