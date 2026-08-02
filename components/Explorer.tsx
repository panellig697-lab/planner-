"use client";

import { useState } from "react";
import { Plus, Users, Building2, FolderKanban, CheckSquare, Lightbulb, BookOpen } from "lucide-react";
import { SCHEMAS, type EntityType } from "@/lib/schema";
import type { AppState, Company } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import EntityForm from "./EntityForm";
import CompanyWorkspace from "./CompanyWorkspace";
import { formatGBP } from "@/lib/format";
import { SkeletonList } from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";

const TABS: { key: EntityType; icon: typeof Users }[] = [
  { key: "people", icon: Users },
  { key: "companies", icon: Building2 },
  { key: "projects", icon: FolderKanban },
  { key: "tasks", icon: CheckSquare },
  { key: "ideas", icon: Lightbulb },
  { key: "knowledge", icon: BookOpen },
];

export default function Explorer({
  state,
  mutate,
  loading,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  loading: boolean;
}) {
  const [tab, setTab] = useState<EntityType>("people");
  const [editing, setEditing] = useState<string | null>(null); // row id, or "new"
  const [openCompany, setOpenCompany] = useState<Company | null>(null);

  const schema = SCHEMAS[tab];
  const rows = state[tab] as unknown as Record<string, unknown>[];

  function selectTab(t: EntityType) {
    setTab(t);
    setEditing(null);
    setOpenCompany(null);
  }

  if (openCompany) {
    return (
      <CompanyWorkspace
        company={openCompany}
        state={state}
        mutate={mutate}
        onBack={() => setOpenCompany(null)}
      />
    );
  }

  return (
    <div>
      <div className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => selectTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
              tab === t.key ? "bg-ink text-paper" : "border border-line text-ink-soft hover:text-ink"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {SCHEMAS[t.key].label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="label-caps">{rows.length} {schema.label.toLowerCase()}</span>
        {editing !== "new" && (
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1 rounded-lg bg-rust px-3 py-1.5 text-sm font-medium text-paper shadow-soft transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Add {schema.singular}
          </button>
        )}
      </div>

      {editing === "new" && (
        <div className="mb-4">
          <EntityForm schema={schema} state={state} onDone={() => setEditing(null)} mutate={mutate} />
        </div>
      )}

      {loading && rows.length === 0 ? (
        <SkeletonList rows={5} />
      ) : rows.length === 0 && editing !== "new" ? (
        <EmptyState icon={schema.type === "companies" ? Building2 : Users} title={`No ${schema.label.toLowerCase()} yet`} description="Add your first one to get started." />
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
                  onClick={() =>
                    tab === "companies"
                      ? setOpenCompany(row as unknown as Company)
                      : setEditing(row.id as string)
                  }
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
          <span className="rounded-full border border-line bg-paper-dark px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
