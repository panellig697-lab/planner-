"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Search, ArrowLeft, Building2, FolderKanban, CheckSquare, Globe } from "lucide-react";
import type { AppState, Person } from "@/lib/types";
import type { MutatePayload } from "@/lib/useAppState";
import { byId } from "@/lib/format";
import { formatDateLong, formatDateShort } from "@/lib/dateUtils";
import EntityForm from "./EntityForm";
import { SCHEMAS } from "@/lib/schema";
import EmptyState from "./ui/EmptyState";
import { SkeletonList } from "./ui/Skeleton";

export default function ContactsView({
  state,
  mutate,
  loading,
}: {
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  loading: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const companiesById = byId(state.companies);
  const selected = selectedId ? state.people.find((p) => p.id === selectedId) ?? null : null;

  if (selected) {
    return (
      <ContactProfile
        person={selected}
        state={state}
        mutate={mutate}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  const filtered = state.people
    .filter((p) => {
      if (!query.trim()) return true;
      const company = p.company_id[0] ? companiesById.get(p.company_id[0]) : undefined;
      const haystack = `${p.name} ${p.role} ${company?.name ?? ""} ${p.email ?? ""}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="w-full rounded-xl border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink shadow-soft outline-none transition focus:border-rust/50"
          />
        </div>
        <span className="label-caps shrink-0">{filtered.length}</span>
      </div>

      {loading && state.people.length === 0 ? (
        <SkeletonList rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={state.people.length === 0 ? "No contacts yet" : "No contacts match"}
          description={state.people.length === 0 ? "People you add will show up here." : "Try a different search term."}
        />
      ) : (
        <ul className="space-y-1.5">
          {filtered.map((p) => {
            const company = p.company_id[0] ? companiesById.get(p.company_id[0]) : undefined;
            return (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className="card flex w-full items-center gap-3 px-3.5 py-3 text-left animate-fade-in"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-dark text-sm font-semibold text-ink-soft">
                    {initials(p.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {[p.role, company?.name].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  {p.relationship && (
                    <span className="shrink-0 rounded-full border border-line bg-paper-dark px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                      {p.relationship}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function ContactProfile({
  person,
  state,
  mutate,
  onBack,
}: {
  person: Person;
  state: AppState;
  mutate: (payload: MutatePayload) => Promise<{ id: string }>;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const company = person.company_id[0]
    ? state.companies.find((c) => c.id === person.company_id[0])
    : undefined;

  const linkedTasks = useMemo(
    () => state.tasks.filter((t) => t.person_id.includes(person.id)),
    [state.tasks, person.id]
  );
  const linkedProjects = useMemo(() => {
    const viaTasks = new Set(linkedTasks.flatMap((t) => t.project_id));
    const projects = state.projects.filter(
      (proj) => proj.client_person_id.includes(person.id) || viaTasks.has(proj.id)
    );
    return projects;
  }, [state.projects, linkedTasks, person.id]);

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Contacts
      </button>

      <div className="card mb-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-paper-dark text-lg font-semibold text-ink-soft">
              {initials(person.name)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">{person.name}</h2>
              <p className="text-sm text-ink-soft">
                {[person.role, company?.name].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </div>
          {person.relationship && (
            <span className="shrink-0 rounded-full border border-line bg-paper-dark px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
              {person.relationship}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {person.email && (
            <a href={`mailto:${person.email}`} className="flex items-center gap-1.5 text-ink-soft transition hover:text-rust-dark">
              <Mail className="h-3.5 w-3.5" /> {person.email}
            </a>
          )}
          {person.phone && (
            <a href={`tel:${person.phone}`} className="flex items-center gap-1.5 text-ink-soft transition hover:text-rust-dark">
              <Phone className="h-3.5 w-3.5" /> {person.phone}
            </a>
          )}
          {company?.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-ink-soft transition hover:text-rust-dark"
            >
              <Globe className="h-3.5 w-3.5" /> {company.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-soft sm:grid-cols-3">
          <div>
            <p className="label-caps">Last Contacted</p>
            <p className="mt-0.5 text-ink">{formatDateLong(person.last_contacted)}</p>
          </div>
          <div>
            <p className="label-caps">Next Follow-up</p>
            <p className="mt-0.5 text-ink">{formatDateLong(person.next_follow_up)}</p>
          </div>
        </div>

        {person.notes && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-ink-soft">{person.notes}</p>
        )}

        <button
          onClick={() => setEditing((e) => !e)}
          className="mt-4 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-rust/40 hover:text-rust-dark"
        >
          {editing ? "Close editor" : "Edit contact"}
        </button>
        {editing && (
          <div className="mt-3">
            <EntityForm
              schema={SCHEMAS.people}
              state={state}
              initial={person as unknown as Record<string, unknown>}
              onDone={() => setEditing(false)}
              mutate={mutate}
            />
          </div>
        )}
      </div>

      <section className="mb-5">
        <h3 className="label-caps mb-2 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" /> Linked Company
        </h3>
        {company ? (
          <div className="card px-3.5 py-3">
            <p className="text-sm font-medium text-ink">{company.name}</p>
            <p className="text-xs text-ink-soft">{company.industry || company.area || "—"}</p>
          </div>
        ) : (
          <p className="text-sm italic text-ink-soft/70">No linked company.</p>
        )}
      </section>

      <section className="mb-5">
        <h3 className="label-caps mb-2 flex items-center gap-1.5">
          <FolderKanban className="h-3.5 w-3.5" /> Linked Projects
        </h3>
        {linkedProjects.length === 0 ? (
          <p className="text-sm italic text-ink-soft/70">No linked projects.</p>
        ) : (
          <ul className="space-y-1.5">
            {linkedProjects.map((p) => (
              <li key={p.id} className="card px-3.5 py-2.5 text-sm text-ink">
                {p.name}
                {p.status && <span className="ml-2 text-xs text-ink-soft">· {p.status}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="label-caps mb-2 flex items-center gap-1.5">
          <CheckSquare className="h-3.5 w-3.5" /> Tasks
        </h3>
        {linkedTasks.length === 0 ? (
          <p className="text-sm italic text-ink-soft/70">No tasks linked to this contact.</p>
        ) : (
          <ul className="space-y-1.5">
            {linkedTasks.map((t) => (
              <li key={t.id} className="card flex items-center justify-between px-3.5 py-2.5 text-sm">
                <span className="text-ink">{t.task}</span>
                <span className="text-xs text-ink-soft">{formatDateShort(t.deadline)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
