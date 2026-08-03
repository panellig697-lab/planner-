"use client";

import { useRef, useState } from "react";
import { SCHEMAS, type EntitySchema, type FieldDef } from "@/lib/schema";
import type { AppState } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";

export default function EntityForm({
  schema,
  state,
  initial,
  onDone,
  mutate,
}: {
  schema: EntitySchema;
  state: AppState;
  initial?: Record<string, unknown>;
  onDone: () => void;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
}) {
  function defaultsFor(source?: Record<string, unknown>) {
    const v: Record<string, unknown> = {};
    for (const field of schema.fields) {
      v[field.key] = source?.[field.key] ?? (field.type === "relation" || field.type === "multiselect" ? [] : "");
    }
    return v;
  }

  const [values, setValues] = useState<Record<string, unknown>>(() => defaultsFor(initial));
  // Snapshot of the values the form was opened with, so we can submit only
  // the fields that actually changed instead of resending the whole row.
  const [initialSnapshot] = useState<Record<string, unknown>>(() => defaultsFor(initial));
  const [saving, setSaving] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setField(key: string, val: unknown) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const properties = initial
      ? Object.fromEntries(
          schema.fields
            .filter((f) => JSON.stringify(values[f.key]) !== JSON.stringify(initialSnapshot[f.key]))
            .map((f) => [f.key, values[f.key]])
        )
      : values;

    if (initial && Object.keys(properties).length === 0) {
      onDone();
      return;
    }

    setSaving(true);
    setSlow(false);
    setError(null);
    // Saving should never look frozen: if it's still going after a few
    // seconds, say so explicitly instead of leaving a static "Saving…".
    slowTimer.current = setTimeout(() => setSlow(true), 4_000);
    try {
      await mutate({
        type: schema.type,
        action: initial ? "update" : "create",
        id: initial?.id as string | undefined,
        properties,
      });
      onDone();
    } catch (err: any) {
      setError(err?.message ?? "Save failed");
    } finally {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      setSaving(false);
      setSlow(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-4">
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rust bg-rust/10 px-3 py-2.5 text-sm text-rust-dark animate-fade-in">
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </div>
      )}
      {slow && (
        <div role="status" className="rounded-lg border border-line bg-paper-dark px-3 py-2 text-xs text-ink-soft animate-fade-in">
          Still working — Notion is taking longer than usual to respond…
        </div>
      )}
      {schema.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={(v) => setField(field.key, v)}
          state={state}
        />
      ))}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-rust px-3.5 py-2 text-sm font-medium text-paper shadow-soft transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Create"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-line px-3.5 py-2 text-sm text-ink-soft transition hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  state,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  state: AppState;
}) {
  const baseClass =
    "w-full rounded-lg border border-line bg-paper px-2.5 py-2 text-sm text-ink outline-none transition focus:border-rust/50";

  if (field.type === "title" || field.type === "text") {
    return (
      <label className="block">
        <span className="label-caps mb-1 block">{field.label}</span>
        {field.type === "text" ? (
          <textarea
            className={baseClass}
            rows={2}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className={baseClass}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required
          />
        )}
      </label>
    );
  }

  if (field.type === "email" || field.type === "phone" || field.type === "url") {
    const inputType = field.type === "email" ? "email" : field.type === "phone" ? "tel" : "url";
    return (
      <label className="block">
        <span className="label-caps mb-1 block">{field.label}</span>
        <input
          type={inputType}
          className={baseClass}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (field.type === "number") {
    return (
      <label className="block">
        <span className="label-caps mb-1 block">{field.label}{field.currency ? " (£)" : ""}</span>
        <input
          type="number"
          className={baseClass}
          value={(value as string | number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </label>
    );
  }

  if (field.type === "date") {
    return (
      <label className="block">
        <span className="label-caps mb-1 block">{field.label}</span>
        <input
          type="date"
          className={baseClass}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        <span className="label-caps mb-1 block">{field.label}</span>
        <select
          className={baseClass}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "multiselect") {
    return (
      <fieldset>
        <legend className="label-caps mb-1">{field.label}</legend>
        <input
          className={baseClass}
          placeholder="comma-separated tags"
          value={((value as string[]) ?? []).join(", ")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />
      </fieldset>
    );
  }

  if (field.type === "relation" && field.relation) {
    const options = state[field.relation] as { id: string }[];
    const titleField = SCHEMAS[field.relation].titleField;
    const selected = new Set((value as string[]) ?? []);
    return (
      <label className="block">
        <span className="label-caps mb-1 block">{field.label}</span>
        <select
          multiple
          className={`${baseClass} h-24`}
          value={Array.from(selected)}
          onChange={(e) =>
            onChange(Array.from(e.target.selectedOptions).map((o) => o.value))
          }
        >
          {options.map((o: any) => (
            <option key={o.id} value={o.id}>
              {o[titleField] || o.id}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return null;
}
